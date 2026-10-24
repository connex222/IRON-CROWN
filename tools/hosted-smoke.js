'use strict';
// Hosted preflight for the *isolated* Stage 12 Render preview.
// This verifies HTTP delivery and actual TLS WebSocket joins but does NOT
// exercise human UX, private broadband, device sound, or production recovery.
const assert=require('node:assert/strict');
const WebSocket=require('ws');
const base=new URL(process.env.SMOKE_BASE_URL||'https://iron-crown-stage12-preview.onrender.com');
if(!/^https:$/.test(base.protocol))throw Error('SMOKE_BASE_URL must use HTTPS');
const version=process.env.SMOKE_EXPECT_VERSION||'2.0.0-dev.12';
const expectedAudio=Number(process.env.SMOKE_EXPECT_AUDIO||26);
const CHECK_TIMEOUT=90_000;
const sockets=[];
async function get(route){
 const response=await fetch(new URL(route,base),{signal:AbortSignal.timeout(CHECK_TIMEOUT)});
 assert.equal(response.status,200,route+' HTTP '+response.status);
 return response;
}
async function connect(){
 const url=new URL('/socket',base);url.protocol='wss:';
 const ws=new WebSocket(url,{origin:base.origin,handshakeTimeout:30000,perMessageDeflate:false});
 sockets.push(ws);
 const packets=[];
 ws.on('message',raw=>{try{packets.push(JSON.parse(String(raw)));if(packets.length>80)packets.shift();}catch{}});
 await Promise.race([
  new Promise((resolve,reject)=>{ws.once('open',resolve);ws.once('error',reject)}),
  new Promise((_,reject)=>setTimeout(()=>reject(Error('WebSocket connect timed out')),CHECK_TIMEOUT))
 ]);
 return {ws,packets,
  send(data){ws.send(JSON.stringify(data));},
  async wait(predicate,timeout=25000){
   const started=Date.now();
   while(Date.now()-started<timeout){
    const found=packets.find(predicate);if(found)return found;
    if(ws.readyState===WebSocket.CLOSED)throw Error('WebSocket closed while waiting');
    await new Promise(r=>setTimeout(r,25));
   }
   throw Error('No WebSocket response; last message: '+JSON.stringify(packets.at(-1)||{}).slice(0,250));
  }};
}
async function run(){
 const health=await (await get('/health')).json();
 assert.equal(health.status,'ok');assert.equal(health.version,version);
 assert.equal(health.expectedSounds,17);assert.equal(health.installedSounds,17);
 assert.equal(health.extraSounds,expectedAudio-17);
 const manifest=await (await get('/audio/manifest.json')).json();
 assert.equal(manifest.files.length,expectedAudio);
 if(expectedAudio===27)assert.ok(manifest.files.includes('music-five-lost-crowns.mp3'));
 for(const file of ['railway-switch.mp3','music-parlour-deluxe.mp3','ui-confirm.mp3']){
  assert.ok(manifest.files.includes(file),'Audio manifest missing '+file);
 }
 for(const route of ['/tv.html','/phone.html']){
  const html=await(await get(route)).text();
  assert.ok(html.includes('How to Play')||html.includes('How to play'),'Missing rules entry '+route);
 }
 for(const file of ['mastered/music-parlour.mp3','music-parlour-deluxe.mp3','railway-switch.mp3']){
  const response=await fetch(new URL('/audio/'+file,base),{method:'HEAD',signal:AbortSignal.timeout(CHECK_TIMEOUT)});
  assert.equal(response.status,200,'Audio HEAD failed '+file);
  assert.ok(Number(response.headers.get('content-length'))>1000,'Invalid audio '+file);
 }
 const host=await connect();host.send({type:'host'});
 const welcome=await host.wait(x=>x.type==='welcome'&&x.role==='host');
 assert.match(welcome.code,/^[A-Z]{4}$/);
 const code=welcome.code;const players=[];
 for(let i=0;i<8;i++){
  const player=await connect();player.send({type:'join',code,name:'Stage13 QA '+(i+1)});
  const admitted=await player.wait(x=>x.type==='welcome'&&x.role==='player');
  players.push(admitted);
  const state=await host.wait(x=>x.type==='state'&&x.public.players.length===i+1);
  assert.equal(state.public.players.length,i+1);
  for(const identity of players)assert.equal(JSON.stringify(state.public).includes(identity.token),false);
 }
 const denied=await connect();denied.send({type:'join',code,name:'Over capacity'});
 const rejection=await denied.wait(x=>x.type==='error');
 assert.match(rejection.message,/full|maximum eight/i);
 const lastState=await host.wait(x=>x.type==='state'&&x.public.players.length===8);
 assert.equal(lastState.public.players.length,8);
 console.log(JSON.stringify({result:'PASS',testedVersion:health.version,source:base.origin,gameCodeRedacted:true,players:8,expectedAudio,expectedMastered:17,tvAndPhone:'ok',newCueFiles:'ok',transport:'wss',rejectedNinthSeat:true}));
}
run().catch(err=>{console.error('HOSTED SMOKE FAILED:',err.message);process.exitCode=1;}).finally(()=>{for(const ws of sockets)try{ws.terminate()}catch{}});
