'use strict';
const {chromium}=require('playwright'),{spawn}=require('node:child_process'),fs=require('node:fs'),path=require('node:path');
const {once}=require('node:events');
const ROOT=path.resolve(__dirname,'..'),OUT=path.join(ROOT,'qa-output'),PORT=34177,BASE='http://127.0.0.1:'+PORT;
fs.mkdirSync(OUT,{recursive:true});
const results={version:require('../package.json').version,checks:[],failures:[],screenshots:[]};
const check=(name,ok,detail='')=>{results.checks.push({name,pass:!!ok,detail});if(!ok)results.failures.push(name+': '+detail);};
async function snap(page,name){
 await page.screenshot({path:path.join(OUT,name+'.png'),fullPage:true,animations:'disabled'});
 results.screenshots.push(name+'.png');
}
async function inspect(page,label,selectors){
 for(const [name,selector] of selectors){
  const el=page.locator(selector).first();
  const result=await el.evaluate(node=>{const c=getComputedStyle(node),r=node.getBoundingClientRect();
   return {visible:r.width>0&&r.height>0,background:c.backgroundImage,color:c.color,opacity:c.opacity};
  });
  check(label+' '+name+' gold',result.visible&&result.background.includes('gradient'),JSON.stringify(result).slice(0,200));
 }
 const widths=await page.evaluate(()=>({viewport:innerWidth,content:document.documentElement.scrollWidth}));
 check(label+' no horizontal overflow',widths.content<=widths.viewport+3,JSON.stringify(widths));
 const broken=await page.locator('img').evaluateAll(xs=>xs.filter(x=>x.offsetWidth>0&&(!x.complete||x.naturalWidth===0)).map(x=>x.src));
 check(label+' image loading',broken.length===0,broken.slice(0,3).join(','));
}
async function main(){
 const server=spawn(process.execPath,['src/server.js'],{cwd:ROOT,env:{...process.env,PORT:String(PORT),STATE_FILE:''},stdio:['ignore','pipe','pipe']});
 let output='';server.stdout.on('data',d=>output+=d);server.stderr.on('data',d=>output+=d);
 let browser;
 try{
  for(let n=0;n<100&&!output.includes('IRON CROWN');n++)await new Promise(r=>setTimeout(r,90));
  if(!output.includes('IRON CROWN'))throw Error('Server could not start: '+output.slice(0,300));
  browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required']});
  async function open(label,url,width,height,theme='light'){
   const context=await browser.newContext({viewport:{width,height},colorScheme:theme,reducedMotion:'reduce'});
   const page=await context.newPage();
   page.on('pageerror',e=>results.failures.push(label+' JavaScript error: '+e.message));
   const r=await page.goto(BASE+url,{waitUntil:'domcontentloaded'});
   check(label+' page load',r.status()===200,String(r.status()));
   await page.waitForTimeout(400);
   return {page,context};
  }
  for(const [label,w,h,theme] of [['tv-large',1920,1080,'light'],['tv-pc',1280,800,'light'],['tv-tablet',768,1024,'light'],['tv-narrow',390,844,'light'],['tv-mini',320,700,'light'],['tv-dark',1280,800,'dark']]){
   const {page,context}=await open(label,'/',w,h,theme);
   await page.locator('#roomCode').waitFor({state:'visible'});
   await inspect(page,label,[['tycoons','#galleryBtn'],['lore','#chronicleBtn'],['TV sound','#soundBtn'],['audio settings','#audioSettingsBtn'],['How to Play','#rulesBtn'],['hero lore','#heroLore'],['add AI','#botBtn'],['disabled start','#startBtn']]);
   const qr=await page.locator('#qr').evaluate(el=>{
    const q=el.getBoundingClientRect(),container=el.closest('.join-code-grid').getBoundingClientRect();
    return {left:q.left,right:q.right,top:q.top,bottom:q.bottom,frameLeft:container.left,frameRight:container.right,frameTop:container.top,frameBottom:container.bottom};
   });
   check(label+' QR code fully visible',qr.left>=qr.frameLeft-2&&qr.right<=qr.frameRight+2&&qr.top>=qr.frameTop-2&&qr.bottom<=qr.frameBottom+2,JSON.stringify(qr));
   await snap(page,label+'-lobby');
   await page.locator('#rulesBtn').click();
   await page.locator('#guidePage').waitFor({state:'visible'});
   await inspect(page,label+' handbook',[['chapter button','.guide-tabs button[data-guide="actions"]']]);
   await snap(page,label+'-handbook');
   await context.close();
  }
  for(const [label,w,h,theme] of [['phone-320',320,700,'light'],['phone-390',390,844,'light'],['phone-tablet',768,1024,'light'],['phone-desktop',1280,800,'light'],['phone-dark',390,844,'dark']]){
   const {page,context}=await open(label,'/phone.html',w,h,theme);
   await page.locator('#joinBtn').waitFor({state:'visible'});
   await inspect(page,label,[['help','#rules'],['story','#storyBtn'],['sound','#phoneSoundBtn'],['join help','#joinHelp'],['join','#joinBtn']]);
   await snap(page,label+'-join');
   await page.locator('#rules').click();
   await page.locator('#pocketPage').waitFor({state:'visible'});
   await inspect(page,label+' handbook',[['history chapter','.pocket-tabs button[data-page="history"]']]);
   await snap(page,label+'-handbook');
   await context.close();
  }
  const host=await open('real-host','/',1280,800);
  await host.page.waitForFunction(()=>/^[A-Z]{4}$/.test(document.getElementById('roomCode')?.textContent||''));
  const code=(await host.page.locator('#roomCode').textContent()).trim();
  const phone=await open('real-phone','/phone.html',390,844);
  await phone.page.locator('#joinCode').fill(code);
  await phone.page.locator('#joinName').fill('Visual QA Guest');
  await phone.page.locator('#joinBtn').click();
  await phone.page.locator('.avatar-gallery').waitFor({state:'visible',timeout:10000});
  await snap(phone.page,'real-phone-avatar-chooser');
  await phone.page.locator('[data-avatar="augusta"]').click();
  await phone.page.locator('.player-showcase').waitFor({state:'visible',timeout:10000});
  await host.page.locator('#botBtn').click();
  await host.page.locator('#startBtn').waitFor({state:'visible'});
  await host.page.waitForFunction(()=>!document.getElementById('startBtn').disabled);
  await snap(host.page,'real-host-two-seats');
  await host.page.locator('#startBtn').click();
  await phone.page.locator('#keepTickets').waitFor({state:'visible',timeout:10000});
  await snap(phone.page,'real-phone-secret-tickets');
  await snap(host.page,'real-TV-board');
  const audio=await host.context.request.get(BASE+'/audio/manifest.json'),tracks=(await audio.json()).files||[];
  check('audio manifest',audio.status()===200&&tracks.length===17,'HTTP '+audio.status()+', count '+tracks.length);
  const wav=await host.context.request.get(BASE+'/audio/train-whistle.mp3');
  check('train whistle asset',wav.status()===200,'HTTP '+wav.status());
  await host.page.locator('#soundBtn').click();
  check('TV sound enable',await host.page.locator('#soundBtn').getAttribute('aria-pressed')==='true');
  await host.page.locator('#audioSettingsBtn').click();
  check('TV sound mixer',await host.page.locator('#masterVol').count()===1);
  await snap(host.page,'real-TV-audio-settings');
  await phone.page.locator('#phoneSoundBtn').click();
  check('phone sound enable',await phone.page.locator('#phoneSoundBtn').getAttribute('aria-pressed')==='true');
  await phone.context.close();await host.context.close();
 }catch(e){results.failures.push('QA execution: '+e.stack);}
 finally{
  if(browser)await browser.close();
  server.kill('SIGTERM');await Promise.race([once(server,'exit').catch(()=>{}),new Promise(r=>setTimeout(r,1000))]);
  fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(results,null,2));
  console.log('BROWSER QA '+results.checks.filter(x=>x.pass).length+'/'+results.checks.length+' passed, '+results.screenshots.length+' screenshots');
  if(results.failures.length){console.error('BROWSER QA FAILURES '+JSON.stringify(results.failures));process.exitCode=1;}
 }
}
main();