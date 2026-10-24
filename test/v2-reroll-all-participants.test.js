'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const game=require('../src/game');
const tile=(q,r,type='forest')=>({id:`${q},${r}`,q,r,type,owner:null,soldiers:0,city:false,grand:false});

test('v2 Stage 4: a claimant eliminated from rerolls still receives their build refund and Gold',()=>{
 const r=game.createRoom('RAIL');
 const a=game.addPlayer(r,'A'),b=game.addPlayer(r,'B'),c=game.addPlayer(r,'C');
 r.status='reveal';r.tiles=[tile(0,0),tile(1,0),tile(0,1)];
 // All three already paid their costs at Reveal. The third player loses the
 // first roll; A and B reroll once and remain tied, then A wins the next roll.
 for(const p of [a,b,c])p.resources={coal:1,steel:1,gold:2,timber:0,grain:0};
 r.clashes=[{tile:'0,0',defender:null,claimants:[a,b,c].map(p=>({player:p.id,kind:'build',cost:{timber:1,grain:1},sources:[]}))}];
 const sequence=[.75,.75,0,.5,.5,.9,.2];
 const original=Math.random;let calls=0;
 Math.random=()=>sequence[calls++]??0;
 try{game.resolveClashes(r);}finally{Math.random=original;}
 assert.equal(r.tiles[0].owner,a.id);
 assert.equal(r.feed.find(x=>x.kind==='clash').rerolls,2);
 for(const loser of [b,c]){
  assert.equal(loser.resources.timber,1,loser.name+' refunded Timber');
  assert.equal(loser.resources.grain,1,loser.name+' refunded Grain');
  assert.equal(loser.resources.gold,3,loser.name+' consolation Gold');
  assert.equal(loser.reaction,'furious');
 }
 assert.equal(r.feed.find(x=>x.kind==='clash').results.length,3,'TV sees all three rolls');
});

test('v2 Stage 4: tie-only rerolls do not allow a first-round loser to rejoin',()=>{
 const r=game.createRoom('RAIL');const people=['A','B','C'].map(name=>game.addPlayer(r,name));
 r.tiles=[tile(0,0)];r.status='reveal';
 for(const p of people)p.resources={coal:0,steel:0,gold:0,timber:0,grain:0};
 r.clashes=[{tile:'0,0',defender:null,claimants:people.map(p=>({player:p.id,kind:'build',cost:{timber:1,grain:1},sources:[]}))}];
 const rolls=[.5,.5,0,.1,.8];let i=0;const old=Math.random;Math.random=()=>rolls[i++]??0;
 try{game.resolveClashes(r);}finally{Math.random=old;}
 assert.equal(r.tiles[0].owner,people[1].id);
 assert.equal(r.feed.find(e=>e.kind==='clash').rerolls,1);
 assert.equal(people[2].resources.gold,1);
});
