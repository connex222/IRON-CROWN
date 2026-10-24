'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {sendSafely,MAX_PENDING_BYTES}=require('../src/socket-safety');
const fake=(overrides={})=>Object.assign({readyState:1,bufferedAmount:0,sent:[],terminated:0,
 send(body){this.sent.push(JSON.parse(body));},terminate(){this.terminated++;}},overrides);
test('Stage 12 safe socket send keeps normal real-time updates',()=>{
 const w=fake();assert.equal(sendSafely(w,{type:'state',public:{seq:18}}),true);
 assert.deepEqual(w.sent,[{type:'state',public:{seq:18}}]);assert.equal(w.terminated,0);
});
test('Stage 12 snapshots are bounded; a lagging socket is dropped before serialization',()=>{
 const w=fake({bufferedAmount:MAX_PENDING_BYTES+1});let accessed=false;
 const payload={type:'state',get public(){accessed=true;return {};}};
 assert.equal(sendSafely(w,payload),false);assert.equal(w.terminated,1);
 assert.equal(w.sent.length,0);assert.equal(accessed,false);
});
test('Stage 12 closed and broken transports fail without crashing rooms',()=>{
 const closed=fake({readyState:3});assert.equal(sendSafely(closed,{type:'state'}),false);
 assert.equal(closed.terminated,0);assert.equal(closed.sent.length,0);
 const bad=fake({send(){throw Error('connection lost');}});
 assert.equal(sendSafely(bad,{type:'state'}),false);
});
test('Stage 12 outgoing queue accepts boundary but terminates above 512KiB',()=>{
 assert.equal(sendSafely(fake({bufferedAmount:MAX_PENDING_BYTES}),{type:'pong'}),true);
 const w=fake({bufferedAmount:MAX_PENDING_BYTES+1});assert.equal(sendSafely(w,{type:'pong'}),false);
});
