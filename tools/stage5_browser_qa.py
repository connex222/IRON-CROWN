#!/usr/bin/env python3
"""Chromium offline smoke checks for v2 Stage 5; fake transport, real rendered UI and authoritative fixture state."""
import contextlib
import http.server
import json
import subprocess
import pathlib
import threading
import time
import traceback
from playwright.sync_api import sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'docs'/'stage5-run'/'browser'
OUT.mkdir(parents=True,exist_ok=True)
subprocess.run(['node',str(ROOT/'tools'/'stage5_fixture.js')],cwd=ROOT,check=True,capture_output=True,text=True)
FIX=json.loads((ROOT/'tools'/'stage5-fixtures.json').read_text())
class Quiet(http.server.SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT/'public'),**kw)
 def log_message(self,*args):pass
httpd=http.server.ThreadingHTTPServer(('127.0.0.1',0),Quiet)
url=f'http://127.0.0.1:{httpd.server_port}'
thread=threading.Thread(target=httpd.serve_forever,daemon=True)
thread.start()
checks=[];screens=[];errors=[]
def check(label,valid,details=None):
 checks.append({'check':label,'passed':bool(valid),'details':details})
 if not valid:errors.append(f'{label}: {details}')

def transp():
 return '''(() => {
 class WebSocketFake {
   static OPEN=1;static CLOSED=3;static CONNECTING=0;
   constructor(url){this.readyState=1;setTimeout(()=>this.onopen&&this.onopen(),50);}
   send(raw){const msg=JSON.parse(raw);
    if(msg.type==='host')setTimeout(()=>this.onmessage&&this.onmessage({data:JSON.stringify({type:'welcome',role:'host',code:'RAIL',token:'0123456789abcdef01234567'})}),30);
   }
   close(){this.readyState=3;this.onclose&&this.onclose();}
 }
 window.WebSocket=WebSocketFake;
 })();'''

def layout(page,label):
 results=page.evaluate('''() => {
   const root=document.documentElement;
   return {viewport:innerWidth,actual:root.scrollWidth};
 }''')
 check(f'{label}: horizontal scroll',results['actual']<=results['viewport']+3,results)
 # Sandbox browser navigation cannot reach localhost; actual local artwork is injected for screenshot checks.

def save(page,label):
 path=OUT/(label+'.png')
 page.screenshot(path=str(path),full_page=True,animations='disabled')
 screens.append(path.name)

try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  for width,height in [(320,700),(390,844),(768,1024),(1280,800),(1920,1080)]:
   for device in ['tv','phone']:
    context=browser.new_context(viewport={'width':width,'height':height},color_scheme='light',reduced_motion='reduce')
    page=context.new_page()
    page.evaluate(transp())
    page.evaluate('''() => {const cache=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>cache.get(k)||null,setItem:(k,v)=>cache.set(k,String(v)),removeItem:k=>cache.delete(k)}})}''')
    page.on('pageerror',lambda e,device=device,width=width:errors.append(f'Uncaught {device} {width}: {e.message}'))
    page.set_content((ROOT/'public'/('tv.html' if device=='tv' else 'phone.html')).read_text(),wait_until='domcontentloaded',timeout=12000)
    page.wait_for_timeout(200)
    check(f'{device}-{width}: help available',page.locator('#rulesBtn' if device=='tv' else '#rules').count()==1)
    # Verify the premium primary-button gradient is not silently overridden by
    # late stylesheet rules. Phone primary controls must meet the 56px target.
    primary=page.locator('#joinBtn' if device=='phone' else '#startBtn')
    button=primary.evaluate('''(e)=>{const c=getComputedStyle(e),r=e.getBoundingClientRect();return {background:c.backgroundImage, height:r.height, visible:r.width>0&&r.height>0};}''')
    check(f'{device}-{width}: premium primary gold background',button['visible'] and 'gradient' in button['background'],button)
    if device=='phone':
     check(f'{device}-{width}: primary touch target at least 56px',button['height']>=56,button)
    else:
     qr=page.locator('#qr')
     if qr.count() and qr.is_visible():
      box=qr.evaluate('''e=>{let a=e.getBoundingClientRect(),b=e.closest('.join-code-grid').getBoundingClientRect();return {within:a.left>=b.left-2&&a.right<=b.right+2&&a.top>=b.top-2&&a.bottom<=b.bottom+2}}''')
      check(f'{device}-{width}: QR stays inside join panel',box['within'],box)
    layout(page,f'{device}-{width}: join')
    if width in (320,1280,1920):save(page,f'{device}-{width}-join')
    for phase in ['plan','market','finished','shared']:
     state=FIX[phase]
     if device=='phone':
      page.evaluate('''(snap)=>{if(snap.public.status==='market')snap.public.deadline=Date.now()+20000;pid=snap.playerId;room='RAIL';publicS=snap.public;privateS=snap.private;lastRenderKey='';tutorial=false;render();}''',state)
      if phase=='plan':check(f'phone-{width}: three action slots',page.locator('[data-slot]').count()==3)
      if phase=='market':
       count=page.locator('[data-accept]').count()
       text=page.locator('#app').inner_text()
       check(f'phone-{width}: two offers',count==2 and 'One shared market window' in text,str(count)+' '+text[:140])
      if phase=='shared':check(f'phone-{width}: shared Crown', 'Joint Champion' in page.locator('#app').inner_text())
      if phase=='finished':check(f'phone-{width}: Royal Ledger visible','Final Royal Ledger' in page.locator('#app').inner_text())
     else:
      page.evaluate('''(snap)=>{if(snap.public.status==='market')snap.public.deadline=Date.now()+20000;publicState=snap.public;code='RAIL';hostAuthenticated=true;render();}''',state)
      if phase=='market':check(f'tv-{width}: Exchange banner','Exchange' in page.locator('body').inner_text() or 'MARKET' in page.locator('body').inner_text())
      if phase=='shared':
       page.evaluate('showResults()')
       check(f'tv-{width}: shared Crown', 'SHARED CROWN' in page.locator('body').inner_text())
      if phase=='finished':check(f'tv-{width}: final score present',('THE FINAL RECKONING' in page.locator('body').inner_text() or 'The Iron Crown' in page.locator('body').inner_text()))
     page.wait_for_timeout(80)
     layout(page,f'{device}-{width}: {phase}')
     if width in (320,390,1280) or (width==1920 and phase=='market'):save(page,f'{device}-{width}-{phase}')
    context.close()
  browser.close()
finally:
 httpd.shutdown()
results={'checks':checks,'passed':len(checks)-len(errors),'failed':len(errors),'errors':errors,'screenshots':screens}
(OUT/'report.json').write_text(json.dumps(results,indent=2))
print('Browser QA:',results['passed'],'/',len(checks),'checks;',len(screens),'screenshots;',len(errors),'failures')
for err in errors:print('FAIL',err)
raise SystemExit(1 if errors else 0)
