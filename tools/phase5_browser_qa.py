"""Offline Phase 5 contract card browser acceptance, using real phone markup."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
public=json.loads((ROOT/'tv-game-preview-data.json').read_text())
private=json.loads((ROOT/'phone-game-preview-data.json').read_text())
public['status']='plan';public['deadline']=4102444800000;public['mode']='advanced'
private['ticketProgress']=[
 {'id':private['tickets'][0]['id'],'complete':True,'prestige':4},
 {'id':private['tickets'][1]['id'],'complete':False,'prestige':3}
]
private['planBalance']=private['resources'].copy();private['bankRates']={k:3 for k in private['resources']}
source=(ROOT/'public/phone.html').read_text().replace('render();connect();\n</script>','render();\n</script>').replace('setInterval(()=>{if(publicS)','setInterval(()=>{if(false&&publicS)')
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=b.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.evaluate("()=>Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}}})")
 page.set_content(source,wait_until='domcontentloaded')
 page.evaluate('(a)=>{publicS=a.public;privateS=a.private;pid=a.private.playerId;spectateTickets=true;render()}',{'public':public,'private':private})
 assert page.locator('.ticket-progress-summary').count()==1
 assert '1 / 2 contracts fulfilled' in page.locator('.ticket-progress-summary').inner_text()
 assert 'Unfinished contracts cost 1 Prestige each' in page.locator('.ticket-progress-summary').inner_text()
 assert page.locator('.ticket.complete').count()==1
 assert page.locator('.ticket .points').first.inner_text()=='★ 4 Prestige'
 assert page.locator('text=Your secret destinations').count()==1
 output=ROOT/'phase5-private-tickets-preview.png'
 page.screenshot(path=str(output),full_page=True)
 assert not errors, errors
 b.close()
 print(f'Phase 5 browser checks PASS | one fulfilled of two tickets | screenshot {output} | JavaScript errors: {len(errors)}')
