'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const game=require('../src/game');
const {MODE}=require('../src/constants');
const {args,run}=require('../tools/simulate');
const root=path.join(__dirname,'..');

test('Stage 5 Royal Ledger: awards prestige for banked freight and Gold with separate caps',()=>{
 assert.equal(game.royalDividend({coal:8,timber:8,grain:8,steel:8,gold:12}),6);
 assert.equal(game.royalDividend({coal:1,timber:2,grain:3,steel:1,gold:7}),1);
 assert.equal(game.royalDividend({coal:100,timber:100,grain:100,steel:100,gold:100}),6);
 assert.equal(game.royalDividend({coal:0,timber:0,grain:0,steel:0,gold:0}),0);
 assert.equal(game.royalDividend({coal:-10,timber:0,grain:0,steel:0,gold:-1}),0);
});
test('Stage 5 score counts the final dividend independently without granting it early',()=>{
 const r=game.createRoom('TEST'),p=game.addPlayer(r,'Engineer');
 assert.equal(p.endgameDividend,0);
 const before=game.score(r,p);
 assert.equal(before.dividend,0);
 p.endgameDividend=4;
 const after=game.score(r,p);
 assert.equal(after.dividend,4);
 assert.equal(after.total-before.total,4);
 assert.equal(after.bonus,before.bonus);
});
test('Stage 5 public result shares earned score but never private resource balances',()=>{
 const r=game.createRoom('TEST'),p=game.addPlayer(r,'Engineer');
 p.endgameDividend=3;
 game.updatePrestige(r);
 const publicState=game.publicView(r);
 assert.equal(publicState.players[0].breakdown.dividend,3);
 assert.ok(!Object.hasOwn(publicState.players[0],'resources'));
 assert.ok(!Object.hasOwn(publicState.players[0],'token'));
});
test('Stage 5 simulation can vary map count and win target without mutating release defaults',()=>{
 const seed=100,opts=args(['--players','2','--mode','quick','--games','2','--maps','2','--target','15','--seed',String(seed)]);
 const target=MODE.quick.target,a=run(opts),b=run(opts);
 assert.equal(a.metadata.maps,2);
 assert.equal(a.metadata.target,15);
 assert.deepEqual(a,b);
 assert.equal(MODE.quick.target,target);
 assert.ok(Object.hasOwn(a.winnerSources,'dividend'));
 assert.ok(Object.hasOwn(a.meanWinnerResources,'gold'));
});
test('Stage 5 phone and TV explain final Royal Ledger bonuses',()=>{
 const tv=fs.readFileSync(path.join(root,'public/tv.html'),'utf8');
 const phone=fs.readFileSync(path.join(root,'public/phone.html'),'utf8');
 assert.match(tv,/Royal Ledger/);
 assert.match(phone,/Final Royal Ledger/);
 assert.match(phone,/Royal Ledger gives 1 Prestige/);
 assert.match(tv,/SHARED CROWN/);assert.match(phone,/Joint Champion/);
});
test('Stage 5 Grand Station is actually selected by AI when it already owns a City',()=>{
 const r=game.createRoom('TEST');const p=game.addPlayer(r,'A',true),p2=game.addPlayer(r,'B',true);
 p.avatar='augusta';p2.avatar='silas';
 r.round=9;r.era='electric';r.status='draft';
 r.tiles=[{id:'1,0',q:1,r:0,type:'town',owner:p.id,city:true,soldiers:1}];
 r.routes=[];
 p.draftChoices=[{id:'telegraph'},{id:'station'},{id:'directors'}];p.draftDone=false;
 p2.draftChoices=[{id:'telegraph'},{id:'station'},{id:'directors'}];p2.draftDone=true;
 game.autopilot(r);
 assert.ok(p.upgrades.includes('station'));
 assert.equal(r.tiles[0].grand,true);
});
