'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const net=require('node:net'),path=require('node:path');
const WebSocket=require('ws');
const ROOT=path.resolve(__dirname,'..');
async function freePort(){return await new Promise((resolve,reject)=>{
 const s=net.createServer();s.once('error',reject);
 s.listen(0,'127.0.0.1',()=>{const port=s.address().port;s.close(()=>resolve(port));});
});}
async function server(){
 const port=await freePort();
 const child=spawn(process.execPath,['src/server.js'],{cwd:ROOT,env:{...process.env,PORT:String(port),STATE_FILE:''},stdio:['ignore','pipe','pipe']});
 let errors='';
 child.stderr.on('data',b=>errors+=String(b));
 await Promise.race([
  new Promise((resolve,reject)=>{child.stdout.on('data',b=>{if(String(b).includes('IRON CROWN'))resolve();});child.once('exit',code=>reject(Error('Server exit '+code+': '+errors)));}),
  new Promise((_,reject)=>setTimeout(()=>reject(Error('Server startup expired: '+errors)),8000))
 ]);
 return {port,child,clients:[],async close(){
  for(const c of this.clients)try{c.ws.terminate();}catch{}
  child.kill('SIGTERM');
  if(child.exitCode===null)await Promise.race([new Promise(r=>child.once('exit',r)),new Promise(r=>setTimeout(r,1500))]);
 }};
}
async function client(box,options={}){
 const ws=new WebSocket('ws://127.0.0.1:'+box.port+'/socket',options),packets=[];
 ws.on('message',b=>{try{packets.push(JSON.parse(String(b)));if(packets.length>100)packets.shift();}catch{}});
 await Promise.race([new Promise((resolve,reject)=>{ws.once('open',resolve);ws.once('error',reject);}),new Promise((_,reject)=>setTimeout(()=>reject(Error('connect timeout')),6000))]);
 const c={ws,packets,send(obj){ws.send(JSON.stringify(obj));},wait(pred,ms=6000){
  return new Promise((resolve,reject)=>{
   const first=packets.find(pred);if(first)return resolve(first);
   const started=Date.now();const timer=setInterval(()=>{
    const got=packets.find(pred);if(got){clearInterval(timer);resolve(got);}
    else if(Date.now()-started>ms){clearInterval(timer);reject(Error('No matching packet. Last: '+JSON.stringify(packets.at(-1)).slice(0,300)));}
   },15);
  });
 }};
 box.clients.push(c);return c;
}
test('Stage 12: eight live humans, seat-cap denial, rejoin takeover, and no public token leakage',{timeout:35000},async()=>{
 const box=await server();
 try{
  const host=await client(box);host.send({type:'host'});
  const welcome=await host.wait(m=>m.type==='welcome'&&m.role==='host'),code=welcome.code;
  const players=[];
  for(let i=0;i<8;i++){
   const p=await client(box);p.send({type:'join',code,name:'Guest '+(i+1)});
   const auth=await p.wait(m=>m.type==='welcome'&&m.role==='player');
   players.push({client:p,auth});
   const snapshot=await host.wait(m=>m.type==='state'&&m.public.players.length===i+1);
   assert.equal(snapshot.public.players.length,i+1);
   for(const prior of players)assert.equal(JSON.stringify(snapshot.public).includes(prior.auth.token),false);
  }
  const ninth=await client(box);
  ninth.send({type:'join',code,name:'Ninth seat'});
  assert.match((await ninth.wait(m=>m.type==='error')).message,/full|maximum eight/i);
  const candidate=await client(box);
  candidate.send({type:'join',code,playerId:players[2].auth.playerId,token:'invalid'});
  assert.match((await candidate.wait(m=>m.type==='error')).message,/credentials rejected/i);
  const original=players[2];
  const replacement=await client(box);
  replacement.send({type:'join',code,playerId:original.auth.playerId,token:original.auth.token});
  const reconnect=await replacement.wait(m=>m.type==='welcome'&&m.role==='player');
  assert.equal(reconnect.playerId,original.auth.playerId);
  const state=await replacement.wait(m=>m.type==='state'&&m.public.players.length===8);
  assert.equal(state.public.players.length,8);
  await Promise.race([new Promise(resolve=>original.client.ws.once('close',resolve)),new Promise((_,reject)=>setTimeout(()=>reject(Error('original controller still signed in')),5000))]);
  assert.equal((await host.wait(m=>m.type==='state'&&m.public.players.length===8)).public.players.length,8);
 }finally{await box.close();}
});
test('Stage 12: cross-origin and oversized WebSocket messages are rejected, server remains usable',{timeout:30000},async()=>{
 const box=await server();
 try{
  const hostile=new WebSocket('ws://127.0.0.1:'+box.port+'/socket',{headers:{Origin:'https://untrusted.example'}});
  const originClose=await Promise.race([
   new Promise((resolve,reject)=>{hostile.on('close',code=>resolve(code));hostile.on('error',()=>{});}),
   new Promise((_,reject)=>setTimeout(()=>reject(Error('origin not rejected')),6500))
  ]);
  assert.equal(originClose,1008);
  const attacker=await client(box);
  const closed=new Promise(resolve=>attacker.ws.once('close',code=>resolve(code)));
  attacker.ws.send(JSON.stringify({type:'join',name:'x'.repeat(170*1024)}));
  const code=await Promise.race([closed,new Promise((_,reject)=>setTimeout(()=>reject(Error('oversized packet not rejected')),6000))]);
  assert.equal(code,1009);
  const legitimate=await client(box);legitimate.send({type:'host'});
  const welcome=await legitimate.wait(m=>m.type==='welcome'&&m.role==='host');
  assert.match(welcome.code,/^[A-Z]{4}$/);
 }finally{await box.close();}
});
