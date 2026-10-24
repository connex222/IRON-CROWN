'use strict';
// Recovery copies are sealed on the server and held by the host browser only.
// This is a *fallback* for ephemeral hosts, NOT a replacement for durable storage.
const crypto=require('node:crypto');
const zlib=require('node:zlib');
const {MODE}=require('./constants');
const MAX_RAW=350_000;
const MAX_WIRE=120_000;
const AGE_LIMIT=30*24*60*60*1000;
function key(code,token){
 return crypto.createHash('sha256').update('IRON-CROWN recovery v1|'+code+'|'+token).digest();
}
function seal(room,now=Date.now()){
 if(!room||!/^[A-Z]{4}$/.test(room.code)||!/^[0-9a-f]{24}$/.test(room.hostToken))
  throw Error('Cannot back up an invalid room');
 const plain=Buffer.from(JSON.stringify({version:1,savedAt:now,room}));
 if(plain.length>MAX_RAW)throw Error('Room is too large to back up');
 const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',key(room.code,room.hostToken),iv);
 cipher.setAAD(Buffer.from('IRON-CROWN|'+room.code));
 const compressed=zlib.deflateRawSync(plain,{level:6});
 const payload=Buffer.concat([cipher.update(compressed),cipher.final()]);
 const output={v:1,iv:iv.toString('base64'),data:payload.toString('base64'),tag:cipher.getAuthTag().toString('base64')};
 if(JSON.stringify(output).length>MAX_WIRE)throw Error('Backed-up room exceeds safe message size');
 return output;
}
function unseal(backup,code,token,now=Date.now()){
 if(!/^[A-Z]{4}$/.test(code)||!(/^[0-9a-f]{24}$/.test(token)))throw Error('Recovery credentials are invalid.');
 if(!backup||backup.v!==1||typeof backup.iv!=='string'||typeof backup.data!=='string'||typeof backup.tag!=='string')
  throw Error('Recovery copy invalid or missing.');
 if(JSON.stringify(backup).length>MAX_WIRE)throw Error('Recovery copy too large.');
 for(const part of [backup.iv,backup.data,backup.tag])if(!/^[A-Za-z0-9+/]+={0,2}$/.test(part))
  throw Error('Recovery copy malformed.');
 try{
  const iv=Buffer.from(backup.iv,'base64'),tag=Buffer.from(backup.tag,'base64');
  if(iv.length!==12||tag.length!==16)throw Error('Invalid encryption data');
  const decipher=crypto.createDecipheriv('aes-256-gcm',key(code,token),iv);
  decipher.setAAD(Buffer.from('IRON-CROWN|'+code));decipher.setAuthTag(tag);
  const zipped=Buffer.concat([decipher.update(Buffer.from(backup.data,'base64')),decipher.final()]);
  const plain=zlib.inflateRawSync(zipped,{maxOutputLength:MAX_RAW});
  const saved=JSON.parse(plain);
  if(saved.version!==1||!Number.isSafeInteger(saved.savedAt)||saved.savedAt>now+300_000||saved.savedAt<now-AGE_LIMIT)
   throw Error('Recovery copy expired.');
  const room=saved.room;
  if(!room||room.code!==code||room.hostToken!==token||!Object.hasOwn(MODE,room.mode))
   throw Error('Recovered room does not match the original.');
  if(!['lobby','tickets','placement','draft','income','plan','offer','market','reveal','finished'].includes(room.status)
    ||!Array.isArray(room.players)||room.players.length>8||!Array.isArray(room.tiles)||room.tiles.length>100
    ||!Array.isArray(room.routes)||room.routes.length>100||!Array.isArray(room.ticketDeck)
    ||!Array.isArray(room.pending)||!Array.isArray(room.feed))
   throw Error('Recovered room has invalid game data.');
  const seen=new Set();
  for(const p of room.players){
   if(!p||typeof p.id!=='string'||typeof p.token!=='string'||typeof p.name!=='string'
     ||!/^[0-9a-f]{24}$/.test(p.id)||!/^[0-9a-f]{24}$/.test(p.token)
     ||p.name.length>24||seen.has(p.id))throw Error('Invalid recovered seat.');
   seen.add(p.id);
   p.connected=!!p.ai;
  }
  room.settings=MODE[room.mode];
  if(room.status!=='lobby'&&room.status!=='finished'){
   // Give returning phones at least two minutes; do not immediately time out
   // a recovered session while the host and players reconnect.
   const remaining=Number(room.deadline)-saved.savedAt;
   if(Number.isFinite(remaining)&&room.deadline>0)room.deadline=now+Math.max(120_000,Math.min(remaining,180_000));
   if(room.offer&&Number.isFinite(room.offer.deadline))room.offer.deadline=now+120_000;
  }
  return {room,ageSeconds:Math.max(0,Math.floor((now-saved.savedAt)/1000))};
 }catch(e){
  throw Error('Recovery copy invalid, expired or tampered with.');
 }
}
module.exports={seal,unseal};
