'use strict';
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const WebSocket=require('ws');
const game=require('./game');
const PORT=Number(process.env.PORT)||3000;
const ROOT=path.resolve(__dirname,'../public');
const rooms=new Map(), links=new Map();
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.wav':'audio/wav','.json':'application/json','.ico':'image/x-icon'};
const stateFile=process.env.STATE_FILE===undefined?path.resolve(__dirname,'../.data/rooms.json'):process.env.STATE_FILE;
const isCode=code=>/^[A-Z]{4}$/.test(String(code||''));
function restore(){if(!stateFile)return;try{const data=JSON.parse(fs.readFileSync(stateFile,'utf8'));for(const r of data){if(r&&isCode(r.code)&&r.hostToken&&r.players){r.players.forEach(p=>p.connected=!!p.ai);rooms.set(r.code,r);}}console.log(`Restored ${rooms.size} games`);}catch(e){if(e.code!=='ENOENT')console.warn('Could not restore game state:',e.message);}}
function save(){if(!stateFile)return;try{const target=path.resolve(stateFile);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target+'.tmp',JSON.stringify([...rooms.values()]));fs.renameSync(target+'.tmp',target);}catch(e){console.error('Could not save game state:',e.message);}}
function code4(){const alpha='ABCDEFGHJKLMNPQRSTUVWXYZ';let code='';do{code=Array.from(crypto.randomBytes(4),b=>alpha[b%alpha.length]).join('');}while(rooms.has(code));return code;}
function response(res,status,body,kind='text/plain; charset=utf-8'){
 res.writeHead(status,{'Content-Type':kind,'X-Content-Type-Options':'nosniff','Cache-Control':'no-cache','Content-Security-Policy':"default-src 'self' 'unsafe-inline' data: blob:; connect-src 'self' ws: wss:; img-src 'self' data:; font-src 'self'; object-src 'none'; frame-ancestors 'none'",'Referrer-Policy':'same-origin'});res.end(body);
}
const httpServer=http.createServer((req,res)=>{
 if(req.method!=='GET'&&req.method!=='HEAD')return response(res,405,'Method not allowed');
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(pathname==='/health')return response(res,200,JSON.stringify({status:'ok',rooms:rooms.size}),mime['.json']);
 const urlPath=pathname==='/'?'/tv.html':pathname;
 let file;try{file=path.resolve(ROOT,'.'+decodeURIComponent(urlPath));}catch{return response(res,400,'Invalid URL');}
 if(!file.startsWith(ROOT+path.sep))return response(res,403,'Forbidden');
 fs.stat(file,(err,stat)=>{if(err||!stat.isFile())return response(res,404,'Not found');
  const headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','Content-Length':stat.size,'X-Content-Type-Options':'nosniff','Cache-Control':file.endsWith('.html')?'no-cache':'public, max-age=86400','Content-Security-Policy':"default-src 'self' 'unsafe-inline' data: blob:; connect-src 'self' ws: wss:; img-src 'self' data:; font-src 'self'; object-src 'none'; frame-ancestors 'none'"};
  res.writeHead(200,headers);if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
 });
});
const wss=new WebSocket.Server({server:httpServer,path:'/socket',maxPayload:16*1024,perMessageDeflate:false});
const send=(ws,payload)=>{if(ws.readyState===WebSocket.OPEN)try{ws.send(JSON.stringify(payload));}catch{}};
function broadcast(room){const data=game.publicView(room);for(const [ws,link] of links){if(link.code!==room.code)continue;const packet={type:'state',public:data};if(link.role==='player'){const p=room.players.find(x=>x.id===link.playerId);if(p)packet.private=game.privateView(room,p);}send(ws,packet);}save();}
function bad(ws,error){send(ws,{type:'error',message:String(error?.message||error).slice(0,160)});}
function bind(ws,code,role,playerId=null){
 const prev=links.get(ws);if(prev){const r=rooms.get(prev.code);if(r&&prev.role==='player'){const p=r.players.find(p=>p.id===prev.playerId);if(p)p.connected=false;}}
 for(const [other,l] of links)if(other!==ws&&l.code===code&&l.role===role&&l.playerId===playerId){links.delete(other);try{other.close(4001,'Signed in elsewhere');}catch{}}
 links.set(ws,{code,role,playerId});
}
function host(ws,data){
 let room=null;
 if(isCode(data.code)&&rooms.has(data.code)){
  room=rooms.get(data.code);if(typeof data.token!=='string'||data.token!==room.hostToken)throw Error('Host credentials rejected.');
 }else if(!data.code){room=game.createRoom(code4());rooms.set(room.code,room);}else throw Error('Host room not found.');
 bind(ws,room.code,'host');send(ws,{type:'welcome',role:'host',code:room.code,token:room.hostToken});broadcast(room);
}
function join(ws,data){
 const code=String(data.code||'').trim().toUpperCase();const room=rooms.get(code);if(!room)throw Error('Room not found. Ask the host for the four-letter code.');
 let p=null;if(typeof data.playerId==='string'&&typeof data.token==='string')p=room.players.find(x=>x.id===data.playerId&&x.token===data.token);
 if(!p&&(data.playerId||data.token))throw Error('Rejoin credentials rejected. Clear your saved seat to join as a new player.');
 if(!p){if(room.status!=='lobby')throw Error('This game has started. Rejoin from your original phone.');p=game.addPlayer(room,data.name);}
 if(p.ai)throw Error('That seat is controlled by the computer.');
 p.connected=true;bind(ws,room.code,'player',p.id);send(ws,{type:'welcome',role:'player',code:room.code,playerId:p.id,token:p.token});broadcast(room);
}
function action(ws,data){
 const link=links.get(ws);if(!link)throw Error('Join or host a room first.');
 const room=rooms.get(link.code);if(!room)throw Error('Room no longer exists.');
 const p=link.role==='player'?room.players.find(x=>x.id===link.playerId):null;
 const kind=String(data.kind||'');
 if(link.role==='host'){
  if(kind==='start')game.startGame(room,data.mode);
  else if(kind==='mode'){if(room.status!=='lobby'||!game)throw Error('Mode is locked.');if(!['quick','standard','advanced'].includes(data.mode))throw Error('Invalid mode.');room.mode=data.mode;room.settings=require('./constants').MODE[data.mode];}
  else if(kind==='addAI')game.addPlayer(room,`Iron Bot ${room.players.length+1}`,true);
  else if(kind==='remove'){
   const target=room.players.find(x=>x.id===data.playerId);if(!target)throw Error('Unknown player.');
   if(room.status==='lobby'){room.players.splice(room.players.indexOf(target),1);room.players.forEach((p,i)=>p.seat=i);for(const [other,l] of links)if(l.code===room.code&&l.playerId===target.id){send(other,{type:'removed'});links.delete(other);try{other.close();}catch{}}}
   else{target.ai=true;target.connected=true;game.autopilot(room);}
  }
  else if(kind==='replaceAI'){
   const target=room.players.find(x=>x.id===data.playerId);if(!target)throw Error('Unknown player.');target.ai=true;target.connected=true;
   for(const [other,l] of links)if(l.code===room.code&&l.playerId===target.id){send(other,{type:'removed'});links.delete(other);try{other.close();}catch{}}
   if(room.status==='lobby'&&!target.avatar){target.avatar=require('./constants').AVATARS.find(a=>!room.players.some(x=>x!==target&&x.avatar===a.id))?.id||null;}
   game.autopilot(room);
  }
  else if(kind==='restart'){
   if(room.status!=='finished')throw Error('You can only rematch after a completed game.');
   const newRoom=game.createRoom(room.code);newRoom.hostToken=room.hostToken;newRoom.players=room.players.map(x=>({...x,resources:{},tickets:[],ticketChoices:[],upgrades:[],actions:[null,null],ai:x.ai,locked:false}));newRoom.mode=room.mode;newRoom.settings=require('./constants').MODE[room.mode];rooms.set(room.code,newRoom);
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
   case 'tradeReply':game.replyOffer(room,p,!!data.accept);break;
   case 'telegraph':game.telegraph(room,p,data.slot,data.action);break;
   default:throw Error('Unknown player command.');
  }
 }
 broadcast(room);
}
wss.on('connection',(ws,request)=>{
 // Browsers always provide an Origin. Reject cross-site WebSocket commands.
 const origin=request.headers.origin;const hostHeader=request.headers.host;
 if(origin){try{if(new URL(origin).host!==hostHeader){ws.close(1008,'Origin rejected');return;}}catch{ws.close(1008,'Invalid origin');return;}}
 let lastSecond=0,requests=0;
 ws.on('message',buffer=>{
  const now=Math.floor(Date.now()/1000);if(now!==lastSecond){lastSecond=now;requests=0;}if(++requests>20){bad(ws,'Too many requests.');return;}
  try{const data=JSON.parse(String(buffer));if(!data||Array.isArray(data)||typeof data!=='object')throw Error('Invalid command.');
   if(data.type==='host')host(ws,data);else if(data.type==='join')join(ws,data);else if(data.type==='action')action(ws,data);else throw Error('Unknown message type.');
  }catch(err){bad(ws,err);}
 });
 ws.on('close',()=>{const link=links.get(ws);links.delete(ws);if(link?.role==='player'){const room=rooms.get(link.code);const p=room?.players.find(p=>p.id===link.playerId);if(p&&!p.ai){p.connected=false;broadcast(room);}}});
});
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
