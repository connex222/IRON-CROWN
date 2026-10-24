'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {MODE}=require('../src/constants');
const files=Object.fromEntries(['public/tv.html','public/phone.html','README.md','01-iron-crown.md','HOW-TO-PLAY-AND-LORE.md'].map(p=>[p,fs.readFileSync(path.join(__dirname,'..',p),'utf8')]));
test('server targets and mode descriptions remain 12/22/24',()=>{
 assert.deepEqual([MODE.quick.target,MODE.standard.target,MODE.advanced.target],[12,22,24]);
 for(const file of ['README.md','01-iron-crown.md','HOW-TO-PLAY-AND-LORE.md']){
  assert.match(files[file],/\b12\b/);assert.match(files[file],/\b22\b/);assert.match(files[file],/\b24\b/);
 }
});
test('public TV and private phone onboarding communicate current victory thresholds',()=>{
 assert.match(files['public/tv.html'],/in Quick, <b>22<\/b> in Standard or <b>24<\/b> in Advanced/);
 assert.match(files['public/phone.html'],/22 in Standard<\/strong> or <strong>24 in Advanced/);
});
test('both handbooks distinguish the Advanced-only fourth Gold Ledger point',()=>{
 assert.match(files['public/tv.html'],/5 Gold Prestige in Advanced/);
 assert.match(files['public/phone.html'],/5 from Gold in Advanced/);
 assert.match(files['HOW-TO-PLAY-AND-LORE.md'],/maximum 5 in Advanced/);
});
test('rematch preserves the three-action layout',()=>{
 const server=fs.readFileSync(path.join(__dirname,'../src/server.js'),'utf8');
 assert.match(server,/draftDone:false,actions:\[null,null,null\]/);
});
