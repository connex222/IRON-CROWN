'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {results,failed,scenarios}=require('../tools/release_preflight');
const check=name=>results.find(r=>r.name===name);
test('Stage 9 release preflight covers Quick/Standard/Advanced at 2, 4 and 8 players as applicable',()=>{
 assert.equal(scenarios.length,6);
 assert.equal(check('Quick / 4 players').status,'FAIL');
 assert.match(check('Quick / 4 players').details,/66\.25%/);
 assert.equal(check('Advanced / 8 players').status,'BLOCKED');
});
test('Stage 9 does not mistake generated audio or screenshots for rights and physical acceptance',()=>{
 assert.equal(check('17 audio file checksums').status,'PASS');
 assert.equal(check('Eight original portraits').status,'PASS');
 assert.ok(['PASS','BLOCKED'].includes(check('Browser fixture screenshots').status));
 // Binary fixture screenshots are optional in a source-only CI checkout; NEVER call this a production acceptance pass.
 assert.equal(check('Commercial audio redistribution licence').status,'BLOCKED');
 assert.equal(check('Physical-device and cross-network acceptance').status,'BLOCKED');
 assert.ok(failed.length>=4);
});
