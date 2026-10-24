'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {checkedRows,loadRooms,saveRooms}=require('../src/snapshot-store');
const {MAX_ROOMS}=require('../src/room-lifecycle');
function temp(t){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'iron-stage13-snapshot-'));
 t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 return path.join(dir,'rooms.json');
}
test('Stage 13 snapshot is atomic, privately permissioned, and restores exact rooms',t=>{
 const file=temp(t),original=[{code:'RAIL',hostToken:'a'.repeat(24),players:[{id:'x',token:'secret'}]}];
 assert.equal(loadRooms(file).source,'empty');
 assert.equal(saveRooms(file,original).saved,true);
 assert.deepEqual(loadRooms(file),{rooms:original,source:'primary'});
 if(process.platform!=='win32')assert.equal(fs.statSync(file).mode&0o777,0o600);
 const next=[{code:'PLAT',hostToken:'b'.repeat(24),players:[]}];
 saveRooms(file,next);
 assert.deepEqual(loadRooms(file).rooms,next);
 assert.deepEqual(JSON.parse(fs.readFileSync(file+'.bak','utf8')),original);
 if(process.platform!=='win32')assert.equal(fs.statSync(file+'.bak').mode&0o777,0o600);
});
test('Stage 13 falls back to last complete local copy after corrupted primary',t=>{
 const file=temp(t),first=[{code:'RAIL'}],second=[{code:'PLAT'}];
 saveRooms(file,first);saveRooms(file,second);
 fs.writeFileSync(file,'[{"broken":', 'utf8');
 assert.deepEqual(loadRooms(file),{source:'backup',rooms:first});
});
test('Stage 13 rejects malformed or unbounded room snapshots',t=>{
 const file=temp(t);
 for(const value of [null,{},'bad',Array.from({length:MAX_ROOMS+1},()=>({}))])
  assert.throws(()=>checkedRows(value));
 fs.writeFileSync(file,'{"not":"an array"}');
 assert.throws(()=>loadRooms(file),/No valid local room snapshot/);
});
test('Stage 13 disabled persistence stores nothing and never invents durability',()=>{
 assert.deepEqual(loadRooms(''),{rooms:[],source:'disabled'});
 assert.deepEqual(saveRooms('',[{code:'TEST'}]),{saved:false,reason:'disabled'});
});
