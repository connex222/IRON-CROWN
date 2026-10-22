'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),net=require('node:net');
const {spawn}=require('node:child_process'),{once}=require('node:events');
const WebSocket=require('ws');
const ROOT=path.join(__dirname,'..');
const phone=fs.readFileSync(path.join(ROOT,'public/phone.html'),'utf8');
const server=fs.readFileSync(path.join(ROOT,'src/server.js'),'utf8');
const scripts=[...phone.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]);

test('Phase 7 phone inline code compiles without external JavaScript',()=>{
 assert.equal(scripts.length,1);new vm.Script(scripts[0],{filename:'phone.html'});
});
test('Reconnection banner clears only after authorised welcome, never when socket opens',()=>{
 const s=scripts[0],opened=s.slice(s.indexOf('socket.onopen='),s.indexOf('socket.onmessage='));
 assert.ok(opened.includes("type:'join'"));assert.ok(!opened.includes('clearConnectionBanner'));
 assert.ok(s.includes("if(m.type==='welcome')"));assert.ok(s.includes("connectionEpoch"));
 assert.ok(s.includes('scheduleReconnect()'));assert.ok(s.includes('removedByHost=true'));
});
test('First-round interactive guide is optional and resets after one round',()=>{
 assert.match(phone,/function tutorialPlanCard\(\)/);assert.match(phone,/publicS\?\.round!==1/);
 assert.match(phone,/id="tutorialNext"/);assert.match(phone,/id="tutorialHide"/);
 assert.match(phone,/tutorialTip=\(tutorialTip\+1\)%3/);
 assert.match(phone,/tutorialDismissed=true/);assert.match(phone,/id="lockBtn"/);
});
test('Map, steppers and target selection meet accessible input constraints',()=>{
 assert.match(phone,/\.stepper button\{min-width:56px;width:56px;height:56px\}/);
 assert.match(phone,/el\.onkeydown=e=>\{if\(e\.key==='Enter'\|\|e\.key===' '\)/);
 assert.match(phone,/role="\$\{legal\?'button':'img'\}"/);
 assert.match(phone,/aria-pressed="\$\{i===actionSlot\}"/);
 assert.match(phone,/aria-pressed="\$\{x\.id===selected\}"/);
 assert.match(phone,/prefers-reduced-motion:reduce/);
});
test('Phone accessibility: focus-managed modal, reconnect status and errors',()=>{
 assert.match(phone,/function closeOverlay\(\)/);
 assert.match(phone,/overlayFocusReturn\?\.isConnected/);
 assert.match(phone,/if\(e\.key==='Escape'\)/);
 assert.match(phone,/id="rulesOverlay"[^>]*role="dialog"/);
 assert.match(phone,/id="connection"[^>]*role="status"/);
 assert.match(phone,/id="toast"[^>]*role="alert"/);
});
test('WebSocket heartbeat and rejoin bind order protect the authenticated seat',()=>{
 assert.match(server,/ws\.on\('pong'/);
 assert.match(server,/if\(ws\.isAlive===false\)\{ws\.terminate\(\);continue;\}/);
 assert.match(server,/heartbeats\.unref\(\)/);
 assert.match(server,/bind\(ws,room\.code,'player',p\.id\);p\.connected=true/);
});
test('Trade offer vibrates once per unique offer rather than once each second',()=>{
 assert.match(phone,/lastOfferAlert=null/);
 assert.match(phone,/offerKey&&offerKey!==lastOfferAlert/);
 assert.match(phone,/lastOfferAlert=offerKey/);
});
function availablePort(){return new Promise((resolve,reject)=>{
 const s=net.createServer();s.once('error',reject);
 s.listen(0,'127.0.0.1',()=>{const port=s.address().port;s.close(err=>err?reject(err):resolve(port));});
});}
function message(socket,predicate,ms=7500){return new Promise((resolve,reject)=>{
 const timer=setTimeout(()=>{cleanup();reject(new Error('No expected WS message received'));},ms);
 function cleanup(){clearTimeout(timer);socket.off('message',handler);socket.off('close',closed);}
 function closed(){cleanup();reject(new Error('WebSocket closed during test'));}
 function handler(data){let m;try{m=JSON.parse(String(data));}catch{return;}
  if(predicate(m)){cleanup();resolve(m);}
 }
 socket.on('message',handler);socket.once('close',closed);
});}
async function open(url){const ws=new WebSocket(url);await Promise.race([once(ws,'open'),new Promise((_,reject)=>setTimeout(()=>reject(new Error('WS connect timeout')),7500))]);return ws;}
test('Live sockets: disconnect/rejoin preserves authenticated player and rejects impostors',{timeout:26000},async()=>{
 const port=await availablePort();
 const child=spawn(process.execPath,[path.join(ROOT,'src/server.js')],{cwd:ROOT,env:{...process.env,PORT:String(port),STATE_FILE:''},stdio:['ignore','pipe','pipe']});
 const sockets=[];let stderr='';
 child.stderr.on('data',chunk=>{stderr+=String(chunk);});
 try{
  await Promise.race([
   new Promise((resolve,reject)=>{
    child.stdout.on('data',data=>{if(String(data).includes('IRON CROWN'))resolve();});
    child.once('exit',code=>reject(new Error('Server exited early '+code+' '+stderr)));
   }),
   new Promise((_,reject)=>setTimeout(()=>reject(new Error('Server startup timeout '+stderr)),9000))
  ]);
  const url='ws://127.0.0.1:'+port+'/socket';
  const host=await open(url);sockets.push(host);
  const hw=message(host,m=>m.type==='welcome');host.send(JSON.stringify({type:'host'}));
  const {code}=await hw;assert.match(code,/^[A-Z]{4}$/);
  const first=await open(url);sockets.push(first);
  const fw=message(first,m=>m.type==='welcome');first.send(JSON.stringify({type:'join',code,name:'Tester'}));
  const seat=await fw;assert.ok(seat.playerId&&seat.token);
  const down=message(host,m=>m.type==='state'&&m.public.players.some(p=>p.id===seat.playerId&&!p.connected));
  first.close();await down;
  const second=await open(url);sockets.push(second);
  const sw=message(second,m=>m.type==='welcome');
  const up=message(host,m=>m.type==='state'&&m.public.players.some(p=>p.id===seat.playerId&&p.connected));
  second.send(JSON.stringify({type:'join',code,playerId:seat.playerId,token:seat.token}));
  const resumed=await sw;const state=await up;
  assert.equal(resumed.playerId,seat.playerId);assert.equal(resumed.token,seat.token);
  assert.equal(state.public.players.length,1);
  const same=message(host,m=>m.type==='state'&&m.public.players.length===1);
  second.send(JSON.stringify({type:'join',code,playerId:seat.playerId,token:seat.token}));
  const sameState=await same;assert.equal(sameState.public.players[0].connected,true);
  const impostor=await open(url);sockets.push(impostor);
  const denied=message(impostor,m=>m.type==='error');
  impostor.send(JSON.stringify({type:'join',code,playerId:seat.playerId,token:'invalid'}));
  assert.match((await denied).message,/Rejoin credentials rejected/);
 }finally{
  for(const sock of sockets)sock.terminate();
  child.kill('SIGTERM');
  await Promise.race([once(child,'exit').catch(()=>{}),new Promise(r=>setTimeout(r,1500))]);
 }
});
