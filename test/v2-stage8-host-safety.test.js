'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const server=fs.readFileSync(path.join(__dirname,'../src/server.js'),'utf8');
const {MAX_ROOMS,assertCapacity}=require('../src/room-lifecycle');
const game=require('../src/game');
const recovery=require('../src/recovery');

test('Original host identity is essential for sealed room recovery',()=>{
 const room=game.createRoom('LOCO'),backup=recovery.seal(room);
 assert.throws(()=>recovery.unseal(backup,room.code,'f'.repeat(24)),/invalid/i);
 assert.equal(recovery.unseal(backup,room.code,room.hostToken).room.hostToken,room.hostToken);
});

test('New hosted room and browser restore both enforce a bounded room count',()=>{
 assert.equal(MAX_ROOMS,128);
 assert.doesNotThrow(()=>assertCapacity(new Map(Array.from({length:127},(_,i)=>[i,{}]))));
 assert.throws(()=>assertCapacity(new Map(Array.from({length:128},(_,i)=>[i,{}]))),/room limit/i);
 const createBranch=server.slice(server.indexOf('function host(ws,data)'),server.indexOf('function join(ws,data)'));
 assert.match(createBranch,/else if\(isCode\(data\.code\)\&\&data\.recovery\)\{[\s\S]*?sweepRooms\(\);[\s\S]*?assertCapacity\(rooms\)/);
 assert.match(createBranch,/else if\(!data\.code\)\{sweepRooms\(\);assertCapacity\(rooms\)/);
 assert.match(createBranch,/room=recovered\.room;markActivity\(room\);rooms\.set\(room\.code,room\)/);
});

test('Malformed HTTP URLs receive 400 instead of throwing through an HTTP callback',()=>{
 assert.match(server,/try\{pathname=new URL\(req\.url,'http:\/\/localhost'\)\.pathname;\}/);
 assert.match(server,/catch\{return response\(res,400,'Invalid URL'\);\}/);
});

test('Security patch level for WebSocket runtime requires ws 8.22 or newer',()=>{
 const manifest=require('../package.json');
 assert.equal(manifest.dependencies.ws,'^8.22.0');
});
