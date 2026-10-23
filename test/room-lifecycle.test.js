'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {MAX_ROOMS,isExpired,assertCapacity}=require('../src/room-lifecycle');
test('room cap refuses 128 and accepts 127',()=>{
 assert.doesNotThrow(()=>assertCapacity(new Map(Array.from({length:127},(_,i)=>[i,true]))));
 assert.throws(()=>assertCapacity(new Map(Array.from({length:MAX_ROOMS},(_,i)=>[i,true]))),/limit/);
});
test('inactive room expiry is bounded, active rooms never expire',()=>{
 const now=2000000000000,old=now-49*60*60*1000;
 assert.equal(isExpired({status:'playing',lastActivityAt:old},now,false),true);
 assert.equal(isExpired({status:'playing',lastActivityAt:old},now,true),false);
 assert.equal(isExpired({status:'lobby',lastActivityAt:now-60*60*1000},now,false),false);
});
