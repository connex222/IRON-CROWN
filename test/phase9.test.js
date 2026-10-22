'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),net=require('node:net');
const {spawn}=require('node:child_process'),WebSocket=require('ws');
const game=require('../src/game'),recovery=require('../src/recovery');
const ROOT=path.resolve(__dirname,'..');
test('Encrypted host copy is versioned and contains no readable secret ticket or seat token',()=>{
 const room=game.createRoom('RAIL'),p=game.addPlayer(room,'Augusta');
 p.tickets=[{id:'A-PRIVATE-TICKET',a:'A',b:'B',value:3}];
 const copy=recovery.seal(room);
 assert.equal(copy.v,1);assert.ok(copy.data.length>50);
 assert.ok(!JSON.stringify(copy).includes('A-PRIVATE-TICKET'));
 assert.ok(!JSON.stringify(copy).includes(p.token));
 const got=recovery.unseal(copy,'RAIL',room.hostToken);
 assert.equal(got.room.players[0].tickets[0].id,'A-PRIVATE-TICKET');
 assert.equal(got.room.players[0].token,p.token);
});
test('Room recovery rejects tampering, wrong host key, mismatched code and expired copies',()=>{
 const r=game.createRoom('RAIL'),now=Date.now(),backup=recovery.seal(r,now);
 assert.throws(()=>recovery.unseal(backup,'RAIL','a'.repeat(24),now),/invalid/i);
 assert.throws(()=>recovery.unseal(backup,'MINE',r.hostToken,now),/invalid/i);
 assert.throws(()=>recovery.unseal({...backup,data:backup.data.slice(0,-4)+'AAAA'},'RAIL',r.hostToken,now),/invalid/i);
 assert.throws(()=>recovery.unseal(backup,'RAIL',r.hostToken,now+31*24*3600_000),/invalid/i);
});
test('Restored human seats become offline, AI seats remain online and the deadline gains a grace period',()=>{
 const r=game.createRoom('RAIL'),a=game.addPlayer(r,'Player'),bot=game.addPlayer(r,'Bot',true);
 const t=Date.now();r.status='plan';r.round=3;r.deadline=t+2000;
 a.connected=true;bot.connected=true;
 const result=recovery.unseal(recovery.seal(r,t),'RAIL',r.hostToken,t+50_000);
 assert.equal(result.room.players[0].connected,false);
 assert.equal(result.room.players[1].connected,true);
 assert.ok(result.room.deadline>=t+170_000);
 assert.equal(result.room.players[0].id,a.id);
});
function port(){return new Promise((resolve,reject)=>{const s=net.createServer();s.once('error',reject);
 s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(e=>e?reject(e):resolve(p));});});}
function msg(socket,match,timeout=6000){return new Promise((resolve,reject)=>{
 const timer=setTimeout(()=>{socket.off('message',onMsg);reject(Error('Expected socket packet did not arrive'));},timeout);
 const onMsg=raw=>{let data;try{data=JSON.parse(String(raw));}catch{return;}if(match(data)){
  clearTimeout(timer);socket.off('message',onMsg);resolve(data);
 }};socket.on('message',onMsg);
});}
async function server(){
 const p=await port(),child=spawn(process.execPath,[path.join(ROOT,'src/server.js')],{
  cwd:ROOT,env:{...process.env,PORT:String(p),STATE_FILE:''},stdio:['ignore','pipe','pipe']
 });
 let output='';child.stdout.on('data',d=>output+=d);
 child.stderr.on('data',d=>output+=d);
 await Promise.race([
  new Promise((res,rej)=>{const check=()=>{if(output.includes('IRON CROWN'))res();};child.stdout.on('data',check);setTimeout(check,180);child.once('exit',c=>rej(Error('Server crashed: '+c+' '+output)));}),
  new Promise((_,rej)=>setTimeout(()=>rej(Error('Server failed to start: '+output)),6500))
 ]);
 return {p,child,async stop(){child.kill('SIGTERM');if(child.exitCode===null)await Promise.race([
  new Promise(res=>child.once('exit',res)),new Promise(res=>setTimeout(res,1200))
 ]);}};
}
async function connect(port){const ws=new WebSocket('ws://127.0.0.1:'+port+'/socket');
 await new Promise((res,rej)=>{ws.once('open',res);ws.once('error',rej);});return ws;}
test('Actual server reboot: TV restores its room, human identity and private ticket from sealed backup',{timeout:23000},async()=>{
 const original=await server();let newServer=null;
 let host,player,newHost,newPlayer;
 try{
  host=await connect(original.p);
  const first=msg(host,m=>m.type==='welcome');host.send(JSON.stringify({type:'host'}));
  const initial=await first,code=initial.code,token=initial.token;
  player=await connect(original.p);
  const welcomed=msg(player,m=>m.type==='welcome');player.send(JSON.stringify({type:'join',code,name:'Returning friend'}));
  const seat=await welcomed;assert.ok(seat.playerId&&seat.token);
  const gotCopy=msg(host,m=>m.type==='state'&&m.recovery&&m.public.players.length===1);
  const state=await gotCopy;assert.ok(state.recovery?.data);
  const copy=state.recovery;
  await original.stop();
  newServer=await server();
  newHost=await connect(newServer.p);
  const restored=msg(newHost,m=>m.type==='welcome');
  newHost.send(JSON.stringify({type:'host',code,token,recovery:copy}));
  const hostRecovery=await restored;
  assert.equal(hostRecovery.code,code);assert.equal(hostRecovery.recovered,true);
  newPlayer=await connect(newServer.p);
  const rejoin=msg(newPlayer,m=>m.type==='welcome');
  newPlayer.send(JSON.stringify({type:'join',code,playerId:seat.playerId,token:seat.token}));
  const joined=await rejoin;assert.equal(joined.playerId,seat.playerId);
  const recoveredState=msg(newHost,m=>m.type==='state'&&m.public.players.some(p=>p.id===seat.playerId&&p.connected));
  newHost.send(JSON.stringify({type:'host',code,token}));
  const state2=await recoveredState;
  assert.equal(state2.public.players.length,1);
 }finally{
  for(const ws of [host,player,newHost,newPlayer])try{ws?.terminate();}catch{}
  await original.stop();if(newServer)await newServer.stop();
 }
});
