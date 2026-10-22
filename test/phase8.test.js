'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os');
const path=require('node:path'),vm=require('node:vm'),net=require('node:net'),http=require('node:http');
const {spawn}=require('node:child_process'),WebSocket=require('ws');
const ROOT=path.resolve(__dirname,'..');
const tv=fs.readFileSync(path.join(ROOT,'public/tv.html'),'utf8');
const serverSource=fs.readFileSync(path.join(ROOT,'src/server.js'),'utf8');
const script=[...tv.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)][0][1];
const avatarIds=['augusta','silas','jack','ada','rupert','nell','ottoline','ezra'];
test('TV host code compiles, preserves its room and waits for authenticated welcome',()=>{
 new vm.Script(script);assert.match(script,/hostAuthenticated=false/);
 assert.match(script,/if\(m\.type==='welcome'\)\{/);
 assert.match(script,/hostAuthenticated=true/);
 assert.match(script,/hostRecoveryBlocked=true/);
 assert.match(script,/showHostBanner\('Could not recover your previous game/);
 assert.match(script,/Start a new room/);
 const onOpen=script.slice(script.indexOf('socket.onopen='),script.indexOf('socket.onmessage='));
 assert.ok(!onOpen.includes("classList.add('hidden')"),'Do not hide recovery banner on TCP-only connection');
});
test('TV game-night controls confirm potentially destructive human-seat changes',()=>{
 assert.match(script,/function confirmTakeover\(id\)/);
 assert.match(script,/window\.confirm\('Let the computer take over/);
 assert.match(script,/window\.confirm\('Remove /);
 assert.match(tv,/window\.confirm\('Play another Iron Crown game/);
 assert.match(tv,/id="connection" class="hidden" role="status" aria-live="polite"/);
});
test('Server rejects role switching before adding an unauthorised seat or room',()=>{
 assert.match(serverSource,/existing&&data\.type==='host'/);
 assert.match(serverSource,/existing&&data\.type==='join'/);
 assert.match(serverSource,/Open a new connection to join another seat/);
 assert.match(serverSource,/Open a new connection to host a different room/);
});
test('Server only removes lobby players; mid-game controls require AI takeover',()=>{
 assert.match(serverSource,/room\.status!=='lobby'\)throw Error\('Remove seats only in the lobby/);
 assert.match(serverSource,/if\(target\.ai\)throw Error\('That seat is already controlled by the computer/);
});
test('Rematch drops all game statistics and retains invited friends',()=>{
 assert.match(serverSource,/newRoom\.players=room\.players\.map/);
 for(const fragment of ["draftDone:false","actions:[null,null]","telegraphUsed:false","smuggleUsed:false","bonusPrestige:0","prestige:0","breakdown:{}","reaction:'neutral'"])
  assert.ok(serverSource.includes(fragment),fragment);
});
async function ephemeralPort(){return new Promise((resolve,reject)=>{
 const s=net.createServer();s.once('error',reject);s.listen(0,'127.0.0.1',()=>{
  const p=s.address().port;s.close(err=>err?reject(err):resolve(p));
 });
});}
function waitMessage(socket,pred,timeout=9000){
 return new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>{off();reject(new Error('Missing expected WebSocket message'));},timeout);
  function off(){clearTimeout(timer);socket.off('message',msg);socket.off('close',closed);}
  function closed(){off();reject(new Error('Socket closed before expected message'));}
  function msg(raw){let event;try{event=JSON.parse(String(raw));}catch{return;}
   if(pred(event)){off();resolve(event);}
  }
  socket.on('message',msg);socket.once('close',closed);
 });
}
async function connect(port,options={}){
 const s=new WebSocket('ws://127.0.0.1:'+port+'/socket',options);
 await new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>reject(new Error('WebSocket open timeout')),9000);
  s.once('open',()=>{clearTimeout(timeout);resolve();});
  s.once('error',e=>{clearTimeout(timeout);reject(e);});
 });return s;
}
async function startServer(stateFile=''){
 const port=await ephemeralPort(),child=spawn(process.execPath,[path.join(ROOT,'src/server.js')],{
  cwd:ROOT,env:{...process.env,PORT:String(port),STATE_FILE:stateFile},stdio:['ignore','pipe','pipe']
 });
 let errors='';child.stderr.on('data',d=>errors+=String(d));
 await Promise.race([
  new Promise((resolve,reject)=>{
   child.stdout.on('data',data=>{if(String(data).includes('IRON CROWN'))resolve();});
   child.once('exit',code=>reject(new Error('Game server terminated '+code+' '+errors)));
  }),
  new Promise((_,reject)=>setTimeout(()=>reject(new Error('Startup deadline '+errors)),8500))
 ]);
 const sockets=[];
 return {port,child,sockets,async stop(){
  for(const sock of sockets){try{sock.terminate();}catch{}}
  child.kill('SIGTERM');
  if(child.exitCode===null)await Promise.race([
   new Promise(r=>child.once('exit',r)),new Promise(r=>setTimeout(r,1300))
  ]);
 }};
}
async function hostRoom(box,credentials=null){
 const ws=await connect(box.port);box.sockets.push(ws);
 const ready=waitMessage(ws,m=>m.type==='welcome'&&m.role==='host');
 ws.send(JSON.stringify({type:'host',...(credentials||{})}));
 return {ws,credentials:await ready};
}
async function joinRoom(box,room,name){
 const ws=await connect(box.port);box.sockets.push(ws);
 const ready=waitMessage(ws,m=>m.type==='welcome'&&m.role==='player');
 ws.send(JSON.stringify({type:'join',code:room,name}));
 return {ws,credentials:await ready};
}
function getJson(port,url){return new Promise((resolve,reject)=>{
 http.get({host:'127.0.0.1',port,path:url},res=>{
  let chunks='';res.on('data',d=>chunks+=String(d));
  res.on('end',()=>{try{resolve({status:res.statusCode,json:JSON.parse(chunks)});}catch(e){reject(e)};});
 }).on('error',reject);
});}
for(const n of [2,4,8]){
 test('Live game-night '+n+' seats: avatar joining, confidential tickets and authenticated host',{timeout:45000},async()=>{
  const b=await startServer();
  try{
   const host=await hostRoom(b),code=host.credentials.code;
   const players=[];
   for(let i=0;i<n;i++){
    const presence=waitMessage(host.ws,m=>m.type==='state'&&m.public.players.length===i+1);
    const p=await joinRoom(b,code,'Player '+(i+1));players.push(p);
    const state=await presence;
    assert.equal(state.public.players.length,i+1);
    assert.ok(!JSON.stringify(state.public).includes(p.credentials.token));
    const avatarUpdate=waitMessage(host.ws,m=>m.type==='state'&&m.public.players.some(x=>x.id===p.credentials.playerId&&x.avatar===avatarIds[i]));
    p.ws.send(JSON.stringify({type:'action',kind:'avatar',avatar:avatarIds[i]}));
    await avatarUpdate;
   }
   const start=waitMessage(host.ws,m=>m.type==='state'&&m.public.status==='tickets');
   host.ws.send(JSON.stringify({type:'action',kind:'start',mode:'quick'}));
   const state=await start;
   assert.equal(state.public.players.length,n);
   assert.ok(state.public.players.every(x=>!Object.hasOwn(x,'resources')&&!Object.hasOwn(x,'token')&&!Object.hasOwn(x,'ticketChoices')));
   const privateTicket=waitMessage(players[0].ws,m=>m.type==='state'&&m.public.status==='tickets'&&m.private?.ticketChoices?.length>=2);
   // The ticket message may have already arrived after host's state; request an idempotent authenticated join to get a fresh state.
   const pw=waitMessage(players[0].ws,m=>m.type==='welcome');
   players[0].ws.send(JSON.stringify({type:'join',code,playerId:players[0].credentials.playerId,token:players[0].credentials.token}));
   await pw;
   const ticketView=await privateTicket;
   assert.ok(ticketView.private.ticketChoices.length>=2);
   for(const t of ticketView.private.ticketChoices)assert.ok(!JSON.stringify(state.public).includes(t.id));
   assert.equal((await getJson(b.port,'/health')).json.rooms,1);
  }finally{await b.stop();}
 });
}
test('Live game-night: host recovers the same room; bad tokens and role switching cannot create seats',{timeout:28000},async()=>{
 const b=await startServer();
 try{
  const original=await hostRoom(b),code=original.credentials.code;
  const presence=waitMessage(original.ws,m=>m.type==='state'&&m.public.players.length===1);
  const player=await joinRoom(b,code,'Established player');await presence;
  // Same authenticated connection must not be permitted to switch to a new player.
  const deny=waitMessage(original.ws,m=>m.type==='error');
  original.ws.send(JSON.stringify({type:'join',code,name:'Invisible ghost'}));
  assert.match((await deny).message,/Open a new connection/);
  const after=waitMessage(original.ws,m=>m.type==='state'&&m.public.players.length===1);
  original.ws.send(JSON.stringify({type:'host',code,token:original.credentials.token}));
  assert.equal((await after).public.players.length,1);
  original.ws.close();
  const renewed=await hostRoom(b,{code,token:original.credentials.token});
  assert.equal(renewed.credentials.code,code);
  const bad=await connect(b.port);b.sockets.push(bad);
  const rejection=waitMessage(bad,m=>m.type==='error');
  bad.send(JSON.stringify({type:'host',code,token:'fake'}));
  assert.match((await rejection).message,/Host credentials rejected/);
  const health=await getJson(b.port,'/health');assert.equal(health.json.rooms,1);
  assert.equal(health.status,200);
 }finally{await b.stop();}
});
test('Live game-night: restored completed match rematches cleanly; old phone can be taken over',{timeout:30000},async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'iron-crown-p8-')),file=path.join(dir,'rooms.json');
 const g=require('../src/game'),r=g.createRoom('CROW');
 const a=g.addPlayer(r,'Lady Augusta'),c=g.addPlayer(r,'Colonel Rupert');
 g.chooseAvatar(r,a,'augusta');g.chooseAvatar(r,c,'rupert');
 r.status='finished';r.round=14;r.seq=35;r.lastWinner=a.id;
 a.prestige=18;a.bonusPrestige=7;a.tickets=[{id:'PRIVATE-LINE',a:'town1',b:'town2',value:2}];a.upgrades=['navvies'];
 a.reaction='smug';a.reactionReason='Won';a.reactionUntil=Date.now()+999999;
 fs.writeFileSync(file,JSON.stringify([r]));
 const b=await startServer(file);
 try{
  const host=await hostRoom(b,{code:r.code,token:r.hostToken});
  const reset=waitMessage(host.ws,m=>m.type==='state'&&m.public.status==='lobby'&&m.public.players.length===2);
  host.ws.send(JSON.stringify({type:'action',kind:'restart'}));
  const lobby=(await reset).public;
  assert.ok(lobby.players.every(p=>p.prestige===0&&p.reaction==='neutral'));
  assert.equal(lobby.players[0].id,a.id);assert.equal(lobby.players[0].avatar,'augusta');
  const socket=await connect(b.port);b.sockets.push(socket);
  const restored=waitMessage(socket,m=>m.type==='welcome');
  socket.send(JSON.stringify({type:'join',code:r.code,playerId:a.id,token:a.token}));
  assert.equal((await restored).playerId,a.id);
  const started=waitMessage(host.ws,m=>m.type==='state'&&m.public.status==='tickets');
  host.ws.send(JSON.stringify({type:'action',kind:'start',mode:'standard'}));
  await started;
  const deny=waitMessage(host.ws,m=>m.type==='error');
  host.ws.send(JSON.stringify({type:'action',kind:'remove',playerId:a.id}));
  assert.match((await deny).message,/Remove seats only in the lobby/);
  const takeover=waitMessage(host.ws,m=>m.type==='state'&&m.public.players.some(p=>p.id===a.id&&p.ai));
  host.ws.send(JSON.stringify({type:'action',kind:'replaceAI',playerId:a.id}));
  assert.equal((await takeover).public.players.find(p=>p.id===a.id).ai,true);
  const rerun=waitMessage(host.ws,m=>m.type==='error');
  host.ws.send(JSON.stringify({type:'action',kind:'replaceAI',playerId:a.id}));
  assert.match((await rerun).message,/already controlled by the computer/);
 }finally{await b.stop();fs.rmSync(dir,{recursive:true,force:true});}
});
test('Server serves a healthy room endpoint and local inventory of all 17 audio tracks',{timeout:20000},async()=>{
 const b=await startServer();
 try{
  const health=await getJson(b.port,'/health'),audio=await getJson(b.port,'/audio/manifest.json');
  assert.equal(health.status,200);assert.equal(health.json.status,'ok');
  assert.equal(audio.status,200);assert.equal(audio.json.files.length,17);
  assert.ok(audio.json.files.every(f=>f.endsWith('.mp3')));
 }finally{await b.stop();}
});
