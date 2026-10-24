'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const game=require('../src/game'),{MODE}=require('../src/constants');
const basePath=(n)=>Array.from({length:n+1},(_,i)=>`s${i}`);
function room(){const r=game.createRoom('RAIL');const a=game.addPlayer(r,'Builder'),b=game.addPlayer(r,'Rival');r.status='income';r.round=5;return {r,a,b};}
for(const [length,points] of [[2,1],[3,2],[4,4],[5,7]])test(`B2: ${length}-segment owned route directly scores ${points} Prestige`,()=>{
 const {r,a}=room();r.routes=[{id:'test',owner:a.id,segments:length,path:basePath(length)}];
 assert.equal(game.score(r,a).rail,points);
 assert.equal(game.score(r,a).total,points);
});
test('B2: completed routes score separately from the longest railway trophy, including cumulative charters',()=>{
 const {r,a,b}=room();r.routes=[{id:'one',owner:a.id,segments:3,path:basePath(3)},{id:'two',owner:a.id,segments:2,path:['s3','u1','u2']}];
 game.updatePrestige(r);
 assert.equal(a.breakdown.rail,3);
 assert.equal(a.breakdown.longest,2);
 assert.equal(a.prestige,5);
 assert.equal(b.breakdown.longest,0);
 assert.equal(r.trophies.rail,a.id);
});
test('B4: Hills pay +1 Gold per round in the Iron and Electric eras, but not Steam',()=>{
 for(const era of ['steam','iron','electric']){
  const {r,a,b}=room();r.status='income';r.mode='standard';r.settings=MODE.standard;r.era=era;
  r.tiles=[{id:'hill',q:0,r:1,type:'hill',owner:a.id,soldiers:1}];
  r.routes=[];a.resources.gold=0;b.resources.gold=0;
  game.beginIncome(r);
  const bonus=a.resources.gold-b.resources.gold;
  assert.equal(bonus,era==='steam'?0:1,era);
 }
});
test('B4: Advanced Gold Rush gives two Gold per owned Hill, rather than stacking to three',()=>{
 const {r,a,b}=room();r.mode='advanced';r.settings=MODE.advanced;r.era='iron';r.event={id:'rush'};
 r.tiles=[{id:'hill',q:0,r:1,type:'hill',owner:a.id,soldiers:1}];r.routes=[];
 a.resources.gold=0;b.resources.gold=0;
 game.beginIncome(r);
 assert.equal(a.resources.gold-b.resources.gold,2);
});
test('B2/B4: scoring and Hill production remain server-owned, not supplied by client action',()=>{
 const {r,a}=room();r.routes=[{id:'route',owner:a.id,segments:5,path:basePath(5)}];
 const publicView=game.publicView(r);assert.equal(publicView.players[0].prestige,0);
 game.updatePrestige(r);assert.equal(game.publicView(r).players[0].breakdown.rail,7);
});
