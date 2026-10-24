'use strict';
// File-backed room recovery is *local-only*. Render's ephemeral file system
// cannot preserve this over machine replacement without a mounted persistent disk.
// Never send these plaintext room snapshots to browsers or expose their location.
const fs=require('node:fs'),path=require('node:path');
const {MAX_ROOMS}=require('./room-lifecycle');
function checkedRows(value){
 if(!Array.isArray(value)||value.length>MAX_ROOMS)throw Error('Room snapshot has invalid structure.');
 return value;
}
function loadRooms(filename){
 if(!filename)return {rooms:[],source:'disabled'};
 const name=path.resolve(filename);
 let failure=null;
 for(const [file,source] of [[name,'primary'],[name+'.bak','backup']]){
  try{
   const rows=checkedRows(JSON.parse(fs.readFileSync(file,'utf8')));
   return {rooms:rows,source};
  }catch(err){
   if(err?.code!=='ENOENT')failure=err;
  }
 }
 if(failure)throw Error('No valid local room snapshot or recovery backup.');
 return {rooms:[],source:'empty'};
}
function saveRooms(filename,rooms){
 if(!filename)return {saved:false,reason:'disabled'};
 const file=path.resolve(filename),parent=path.dirname(file),tmp=file+'.tmp';
 const data=JSON.stringify(checkedRows(rooms));
 fs.mkdirSync(parent,{recursive:true,mode:0o700});
 try{
  // Atomic rename means a crash can leave either the previous complete file
  // or the new complete file. A private .bak offers local corruption rollback.
  fs.writeFileSync(tmp,data,{mode:0o600,flag:'w'});
  fs.chmodSync(tmp,0o600);
  if(fs.existsSync(file)){
   fs.copyFileSync(file,file+'.bak');
   fs.chmodSync(file+'.bak',0o600);
  }
  fs.renameSync(tmp,file);
  fs.chmodSync(file,0o600);
  return {saved:true,bytes:Buffer.byteLength(data)};
 }finally{
  try{if(fs.existsSync(tmp))fs.unlinkSync(tmp)}catch{}
 }
}
module.exports={checkedRows,loadRooms,saveRooms};
