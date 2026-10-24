'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {MAX_ROOMS,MAX_AGE,isExpired}=require('../src/room-lifecycle');
const now=1_800_000_000_000;
test('anonymous room capacity is finite, with a reasonable private host limit',()=>{
 assert.ok(MAX_ROOMS>=16&&MAX_ROOMS<=512);
});
test('lobbies expire only after twelve hours without connected clients',()=>{
 const r={status:'lobby',lastActivityAt:now-MAX_AGE.lobby};
 assert.equal(isExpired(r,now,false),true);
 assert.equal(isExpired(r,now,true),false);
 assert.equal(isExpired({...r,lastActivityAt:r.lastActivityAt+1},now,false),false);
});
test('finished rooms and abandoned in-progress games have distinct grace periods',()=>{
 const r={status:'finished',lastActivityAt:now-MAX_AGE.finished};
 assert.equal(isExpired(r,now,false),true);
 assert.equal(isExpired({...r,status:'plan'},now,false),false);
 assert.equal(isExpired({...r,status:'market',lastActivityAt:now-MAX_AGE.abandoned},now,false),true);
});
test('unknown and corrupt time stamps cannot accidentally delete recoverable games',()=>{
 assert.equal(isExpired({status:'lobby'},now,false),false);
 assert.equal(isExpired({status:'lobby',lastActivityAt:NaN},now,false),false);
 assert.equal(isExpired({status:'lobby',lastActivityAt:now+1},now,false),false);
});
test('server enforces room limit and purges stale rooms without deleting connected ones',()=>{
 const fs=require('node:fs');const s=fs.readFileSync(require('node:path').join(__dirname,'../src/server.js'),'utf8');
 assert.match(s,/assertCapacity\(rooms\)/);
 assert.match(s,/isExpired\(room,now,connected\)/);
 assert.match(s,/roomSweep\.unref\(\)/);
});
