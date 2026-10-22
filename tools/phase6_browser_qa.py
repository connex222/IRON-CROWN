"""Phase 6 cinematic browser acceptance, rendering real TV HTML and local PNG assets.
WebSocket start-up is suppressed in this visual-only harness; no server messages
are faked as live multiplayer acceptance.
"""
import copy
import json
import base64
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'qa'
OUT.mkdir(exist_ok=True)
GAME=json.loads((ROOT/'tv-game-preview-data.json').read_text())
LOBBY=json.loads((ROOT/'tv-lobby-preview-data.json').read_text())
HTML=(ROOT/'public/tv.html').read_text().replace('connect();\n</script>','// Offline Chromium fixture: connection suppressed\n</script>').replace("document.addEventListener('error',ev=>{","document.addEventListener('disabled-offline-image-error',ev=>{")
assert HTML!= (ROOT/'public/tv.html').read_text(), 'Unable to suppress WebSocket connection for test'

ASSETS={
 k:'data:image/png;base64,'+base64.b64encode((ROOT/'public'/k.lstrip('/')).read_bytes()).decode('ascii')
 for k in ['/art/iron-crown-premium.png']+[f'/art/avatars/{id}_human.png' for id in ('augusta','silas','jack','ada','rupert','nell','ottoline','ezra')]
}
def hydrate(page):
 page.evaluate("""(assets)=>document.querySelectorAll('img').forEach(img=>{const p=(img.getAttribute('src')||'').split('?')[0];if(assets[p])img.src=assets[p];})""",ASSETS)

with sync_playwright() as pw:
    b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required'])
    page=b.new_page(viewport={'width':1440,'height':900},device_scale_factor=1, reduced_motion='no-preference')
    errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.evaluate("() => {window.fetch=async()=>new Response(JSON.stringify({files:[]}),{status:200,headers:{'Content-Type':'application/json'}});}")
    page.set_content(HTML,wait_until='domcontentloaded')
    page.evaluate('(s)=>{publicState=s;code=s.code;render()}',LOBBY)
    assert page.locator('#lobby').is_visible()
    assert page.locator('#soundBtn').get_attribute('aria-pressed')=='false'
    assert page.locator('.tycoon-faces img').count()==8
    hydrate(page)
    GAME['routes'][0]['owner']=GAME['players'][0]['id']
    page.evaluate('(s)=>{publicState=s;render()}',GAME)
    hydrate(page)
    assert page.locator('#game').is_visible()
    assert page.locator('.moving-train').count()>0, 'The Income phase must animate owned railways'
    assert page.locator('.engine-smoke').count()>0, 'Engine smoke is missing'
    assert page.locator('#map .land-hex').count()==37
    page.screenshot(path=str(OUT/'phase6-income-trains.png'))
    state=copy.deepcopy(GAME)
    state['status']='draft';state['era']='iron';state['seq']+=1
    page.evaluate('(s)=>{publicState=s;render()}',state)
    page.wait_for_timeout(380)
    assert page.locator('#eraCurtain').get_attribute('class').endswith('is-visible')
    assert page.locator('#eraCurtainTitle').inner_text()=='THE IRON AGE'
    page.screenshot(path=str(OUT/'phase6-era-transition.png'))
    p=state['players']
    item={'seq':state['seq']+1,'at':0,'kind':'clash','tile':state['tiles'][0]['id'],'player':p[0]['id'],
          'message':f'{p[0]["name"]} won a clash at the railway frontier!',
          'results':[{'id':p[0]['id'],'roll':5,'score':7},{'id':p[1]['id'],'roll':3,'score':6}]}
    page.evaluate("()=>document.querySelector('#eraCurtain').classList.remove('is-visible')")
    state['seq']=item['seq'];state['status']='reveal';state['feed'].append(item)
    page.evaluate('(s)=>{publicState=s;render()}',state)
    page.wait_for_timeout(260)
    assert page.locator('.cinema-die').count()==2
    assert page.locator('.cinema-die strong').all_text_contents()==['5','3']
    assert page.locator('#notice').is_visible()
    assert page.locator('.cinema-flash.flash').count()==1
    hydrate(page)
    page.screenshot(path=str(OUT/'phase6-clash-reveal.png'))
    page.locator('#audioSettingsBtn').click()
    assert page.locator('#masterVol').count()==1
    page.locator('#masterVol').fill('35')
    assert page.locator('#masterVal').inner_text()=='35%'
    page.locator('#musicVol').fill('10')
    assert page.locator('#musicVal').inner_text()=='10%'
    page.locator('#motionChoice').check()
    assert page.locator('body.minimal-motion').count()==1
    page.locator('#motionChoice').uncheck()
    page.locator('#closeMixer').click()
    page.locator('#soundBtn').click()
    page.wait_for_timeout(180)
    assert page.locator('#soundBtn').get_attribute('aria-pressed')=='true'
    assert page.evaluate('soundManifestReady') is True
    assert not errors,errors
    print('Phase 6 Chromium PASS: income trains + smoke, era curtain, clash dice, audio mixer, mute, reduced motion, 0 JavaScript exceptions')
    for pic in ('phase6-income-trains.png','phase6-era-transition.png','phase6-clash-reveal.png'):
        print(OUT/pic)
    b.close()
