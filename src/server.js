'use strict';
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const WebSocket=require('ws');
const game=require('./game');
const {availableAudio,CUES,EXTRA_CUES}=require('./audio');
const recovery=require('./recovery');
const {isExpired,assertCapacity}=require('./room-lifecycle');
const {sendSafely}=require('./socket-safety');
const GAME_VERSION=require('../package.json').version;
const PORT=Number(process.env.PORT)||3000;
const ROOT=path.resolve(__dirname,'../public');
const rooms=new Map(), links=new Map();
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.woff2':'font/woff2','.wav':'audio/wav','.ogg':'audio/ogg','.mp3':'audio/mpeg','.json':'application/json','.ico':'image/x-icon'};
const stateFile=process.env.STATE_FILE===undefined?path.resolve(__dirname,'../.data/rooms.json'):process.env.STATE_FILE;
const isCode=code=>/^[A-Z]{4}$/.test(String(code||''));
function markActivity(room){room.lastActivityAt=Date.now();}
function sweepRooms(now=Date.now()){
 let deleted=0;
 for(const [code,room] of rooms){
  const connected=[...links.values()].some(link=>link.code===code);
  if(isExpired(room,now,connected)){rooms.delete(code);deleted++;}
 }
 if(deleted)save();
 return deleted;
}
function restore(){if(!stateFile)return;try{const data=JSON.parse(fs.readFileSync(stateFile,'utf8'));for(const r of data){if(r&&isCode(r.code)&&r.hostToken&&r.players){r.players.forEach(p=>p.connected=!!p.ai);if(!Number.isSafeInteger(r.lastActivityAt))r.lastActivityAt=Date.now();rooms.set(r.code,r);}}console.log(`Restored ${rooms.size} games`);}catch(e){if(e.code!=='ENOENT')console.warn('Could not restore game state:',e.message);}}
function save(){if(!stateFile)return;try{const target=path.resolve(stateFile);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target+'.tmp',JSON.stringify([...rooms.values()]));fs.renameSync(target+'.tmp',target);}catch(e){console.error('Could not save game state:',e.message);}}
function code4(){const alpha='ABCDEFGHJKLMNPQRSTUVWXYZ';let code='';do{code=Array.from(crypto.randomBytes(4),b=>alpha[b%alpha.length]).join('');}while(rooms.has(code));return code;}
function response(res,status,body,kind='text/plain; charset=utf-8'){
 res.writeHead(status,{'Content-Type':kind,'X-Content-Type-Options':'nosniff','Cache-Control':'no-cache','Content-Security-Policy':"default-src 'self' 'unsafe-inline' data: blob:; connect-src 'self' ws: wss:; img-src 'self' data:; font-src 'self'; object-src 'none'; frame-ancestors 'none'",'Referrer-Policy':'same-origin'});res.end(body);
}
const httpServer=http.createServer((req,res)=>{
 if(req.method!=='GET'&&req.method!=='HEAD')return response(res,405,'Method not allowed');
 let pathname;
 try{pathname=new URL(req.url,'http://localhost').pathname;}
 catch{return response(res,400,'Invalid URL');}
 if(pathname==='/health')return response(res,200,JSON.stringify({status:'ok',version:GAME_VERSION,rooms:rooms.size,installedSounds:availableAudio(path.join(ROOT,'audio')).filter(f=>CUES.some(k=>f.startsWith(k+'.'))).length,expectedSounds:CUES.length,extraSounds:availableAudio(path.join(ROOT,'audio')).filter(f=>EXTRA_CUES.some(k=>f.startsWith(k+'.'))).length}),mime['.json']);
 if(pathname==='/audio/manifest.json')return response(res,200,JSON.stringify({files:availableAudio(path.join(ROOT,'audio'))}),mime['.json']);
 const urlPath=pathname==='/'?'/tv.html':pathname;
 let file;try{file=path.resolve(ROOT,'.'+decodeURIComponent(urlPath));}catch{return response(res,400,'Invalid URL');}
 if(!file.startsWith(ROOT+path.sep))return response(res,403,'Forbidden');
 fs.stat(file,(err,stat)=>{if(err||!stat.isFile())return response(res,404,'Not found');
  const headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','Content-Length':stat.size,'X-Content-Type-Options':'nosniff','Cache-Control':file.endsWith('.html')?'no-cache':'public, max-age=86400','Content-Security-Policy':"default-src 'self' 'unsafe-inline' data: blob:; connect-src 'self' ws: wss:; img-src 'self' data:; font-src 'self'; object-src 'none'; frame-ancestors 'none'"};
  res.writeHead(200,headers);if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
 });
});
const wss=new WebSocket.Server({server:httpServer,path:'/socket',maxPayload:160*1024,perMessageDeflate:false});
const send=(ws,payload)=>sendSafely(ws,payload,WebSocket.OPEN);
function broadcast(room){
 const data=game.publicView(room);
 let hostBackup=null;
 if([...links.values()].some(link=>link.code===room.code&&link.role==='host')){
  try{hostBackup=recovery.seal(room);}catch(err){console.warn('Browser recovery snapshot not ready:',err.message);}
 }
 for(const [ws,link] of links){
  if(link.code!==room.code)continue;
  const packet={type:'state',public:data};
  if(link.role==='host'&&hostBackup)packet.recovery=hostBackup;
  if(link.role==='player'){const p=room.players.find(x=>x.id===link.playerId);if(p)packet.private=game.privateView(room,p);}
  send(ws,packet);
 }
 save();
}
function bad(ws,error){send(ws,{type:'error',message:String(error?.message||error).slice(0,160)});}
function bind(ws,code,role,playerId=null){
 const prev=links.get(ws);
 if(prev&&(prev.code!==code||prev.role!==role||prev.playerId!==playerId))throw Error('This connection already belongs to another seat. Open a new connection.');
 for(const [other,l] of links)if(other!==ws&&l.code===code&&l.role===role&&l.playerId===playerId){links.delete(other);try{other.close(4001,'Signed in elsewhere');}catch{}}
 links.set(ws,{code,role,playerId});
}
function host(ws,data){
 let room=null,restoredFromBrowser=false;
 if(isCode(data.code)&&rooms.has(data.code)){
  room=rooms.get(data.code);if(typeof data.token!=='string'||data.token!==room.hostToken)throw Error('Host credentials rejected.');
 }else if(isCode(data.code)&&data.recovery){
  // Recovery is another way to *create* a room after a server restart.
  // Apply the same capacity policy as ordinary lobby creation so repeated
  // valid browser snapshots cannot bypass the hosting limit.
  sweepRooms();
  assertCapacity(rooms);
  // Recover only with the original 24-byte host credential. No copy is ever
  // included in public state or sent to player controllers.
  const recovered=recovery.unseal(data.recovery,data.code,data.token);
  room=recovered.room;markActivity(room);rooms.set(room.code,room);restoredFromBrowser=true;
  console.log('Recovered room '+room.code+' from host browser ('+recovered.ageSeconds+' seconds old)');
 }else if(!data.code){sweepRooms();assertCapacity(rooms);room=game.createRoom(code4());markActivity(room);rooms.set(room.code,room);}else throw Error('Host room not found.');
 markActivity(room);bind(ws,room.code,'host');send(ws,{type:'welcome',role:'host',code:room.code,token:room.hostToken,recovered:restoredFromBrowser});broadcast(room);
}
function join(ws,data){
 const code=String(data.code||'').trim().toUpperCase();const room=rooms.get(code);if(!room)throw Error('Room not found. Ask the host for the four-letter code.');
 let p=null;if(typeof data.playerId==='string'&&typeof data.token==='string')p=room.players.find(x=>x.id===data.playerId&&x.token===data.token);
 if(!p&&(data.playerId||data.token))throw Error('Rejoin credentials rejected. Clear your saved seat to join as a new player.');
 if(!p){if(room.status!=='lobby')throw Error('This game has started. Rejoin from your original phone.');p=game.addPlayer(room,data.name);}
 if(p.ai)throw Error('That seat is controlled by the computer.');
 markActivity(room);bind(ws,room.code,'player',p.id);p.connected=true;send(ws,{type:'welcome',role:'player',code:room.code,playerId:p.id,token:p.token});broadcast(room);
}
function action(ws,data){
 const link=links.get(ws);if(!link)throw Error('Join or host a room first.');
 const room=rooms.get(link.code);if(!room)throw Error('Room no longer exists.');
 const p=link.role==='player'?room.players.find(x=>x.id===link.playerId):null;
 const kind=String(data.kind||'');
 if(link.role==='host'){
  if(kind==='start'){
   if(room.players.some(p=>!p.ai&&!p.connected))throw Error('All human players must be online. Reconnect them or assign AI before starting.');
   game.startGame(room,data.mode);
  }
  else if(kind==='mode'){if(room.status!=='lobby'||!game)throw Error('Mode is locked.');if(!['quick','standard','advanced'].includes(data.mode))throw Error('Invalid mode.');room.mode=data.mode;room.settings=require('./constants').MODE[data.mode];}
  else if(kind==='addAI')game.addPlayer(room,`Iron Bot ${room.players.length+1}`,true);
  else if(kind==='remove'){
   if(room.status!=='lobby')throw Error('Remove seats only in the lobby. Use AI takeover during a match.');
   const target=room.players.find(x=>x.id===data.playerId);if(!target)throw Error('Unknown player.');
   room.players.splice(room.players.indexOf(target),1);room.players.forEach((p,i)=>p.seat=i);
   for(const [other,l] of links)if(l.code===room.code&&l.role==='player'&&l.playerId===target.id){send(other,{type:'removed'});links.delete(other);try{other.close();}catch{}}
  }
  else if(kind==='replaceAI'){
   const target=room.players.find(x=>x.id===data.playerId);if(!target)throw Error('Unknown player.');
   if(target.ai)throw Error('That seat is already controlled by the computer.');
   target.ai=true;target.connected=true;
   for(const [other,l] of links)if(l.code===room.code&&l.role==='player'&&l.playerId===target.id){send(other,{type:'removed'});links.delete(other);try{other.close();}catch{}}
   if(room.status==='lobby'&&!target.avatar){target.avatar=require('./constants').AVATARS.find(a=>!room.players.some(x=>x!==target&&x.avatar===a.id))?.id||null;}
   game.autopilot(room);
  }
  else if(kind==='restart'){
   if(room.status!=='finished')throw Error('You can only rematch after a completed game.');
   const newRoom=game.createRoom(room.code);
   newRoom.hostToken=room.hostToken;markActivity(newRoom);
   newRoom.mode=room.mode;newRoom.settings=require('./constants').MODE[room.mode];
   // Preserve friends and their seat credentials, but never reuse last match's score,
   // private contracts, troop orders, era drafts or active reaction animation.
   newRoom.players=room.players.map((x,seat)=>({
    ...x,seat,connected:!!x.ai||[...links].some(([,link])=>link.code===room.code&&link.role==='player'&&link.playerId===x.id),
    resources:{},tickets:[],ticketChoices:[],upgrades:[],draftChoices:[],
    draftDone:false,actions:[null,null,null],locked:false,telegraphUsed:false,smuggleUsed:false,
    bankResource:'coal',bonusPrestige:0,endgameDividend:0,prestige:0,breakdown:{},reaction:'neutral',
    reactionReason:'',reactionUntil:0
   }));
   newRoom.seq=room.seq+1;
   rooms.set(room.code,newRoom);
   broadcast(newRoom);return; // Never send the retired, finished game snapshot.
  }else throw Error('Unknown host command.');
 }else{
  if(!p||p.ai)throw Error('Seat unavailable.');
  switch(kind){
   case 'avatar':game.chooseAvatar(room,p,data.avatar);break;
   case 'tickets':game.chooseTickets(room,p,data.ids);break;
   case 'place':game.placeDepot(room,p,data.tile);break;
   case 'upgrade':game.chooseUpgrade(room,p,data.upgrade,data.bankResource);break;
   case 'setAction':game.setAction(room,p,data.slot,data.action);break;
   case 'lock':game.lockIn(room,p);break;
   case 'tradeReply':game.replyOffer(room,p,!!data.accept,data.offerId);break;
   case 'telegraph':game.telegraph(room,p,data.slot,data.action);break;
   default:throw Error('Unknown player command.');
  }
 }
 markActivity(room);broadcast(room);
}
wss.on('connection',(ws,request)=>{
 // Browsers always provide an Origin. Reject cross-site WebSocket commands.
 const origin=request.headers.origin;const hostHeader=request.headers.host;
 if(origin){try{if(new URL(origin).host!==hostHeader){ws.close(1008,'Origin rejected');return;}}catch{ws.close(1008,'Invalid origin');return;}}
 ws.isAlive=true;
 ws.on('pong',()=>{ws.isAlive=true;});
 ws.on('error',err=>{console.warn('WebSocket connection error:',err.message);});
 let lastSecond=0,requests=0;
 ws.on('message',buffer=>{
  const now=Math.floor(Date.now()/1000);if(now!==lastSecond){lastSecond=now;requests=0;}if(++requests>20){bad(ws,'Too many requests.');return;}
  try{const data=JSON.parse(String(buffer));if(!data||Array.isArray(data)||typeof data!=='object')throw Error('Invalid command.');
   // Prevent an already authenticated socket from minting a second room or
   // secretly adding a new seat by switching its connection role.
   const existing=links.get(ws);
   if(existing&&data.type==='host'&&(existing.role!=='host'||data.code!==existing.code))throw Error('Open a new connection to host a different room.');
   if(existing&&data.type==='join'&&(existing.role!=='player'||existing.code!==String(data.code||'').trim().toUpperCase()||existing.playerId!==data.playerId))throw Error('Open a new connection to join another seat.');
   if(data.type==='host')host(ws,data);else if(data.type==='join')join(ws,data);else if(data.type==='action')action(ws,data);else throw Error('Unknown message type.');
  }catch(err){bad(ws,err);}
 });
 ws.on('close',()=>{const link=links.get(ws);links.delete(ws);if(!link)return;const room=rooms.get(link.code);if(!room)return;markActivity(room);if(link.role==='player'){const p=room.players.find(p=>p.id===link.playerId);if(p&&!p.ai){p.connected=false;broadcast(room);}}});
});
// Detect dead phone sockets so a dropped connection does not leave a ghost seat.
// The client reconnects using the same authenticated seat and token.
const heartbeats=setInterval(()=>{
 for(const ws of wss.clients){
  if(ws.readyState!==WebSocket.OPEN)continue;
  if(ws.isAlive===false){ws.terminate();continue;}
  ws.isAlive=false;
  try{ws.ping();}catch{ws.terminate();}
 }
},30000);
heartbeats.unref();
const roomSweep=setInterval(()=>sweepRooms(),15*60*1000);
roomSweep.unref();
let lastTick=0;
setInterval(()=>{
 const now=Date.now();for(const room of rooms.values()){
  try{const changed=game.tick(room,now);if(changed||now-lastTick>=1000&&room.deadline&&room.status!=='finished')broadcast(room);}catch(err){console.error('Game tick failed:',room.code,err);}
 }
 lastTick=now;
},250).unref();
restore();
httpServer.listen(PORT,'0.0.0.0',()=>console.log(`IRON CROWN | http://localhost:${PORT}`));
module.exports={httpServer,rooms};
