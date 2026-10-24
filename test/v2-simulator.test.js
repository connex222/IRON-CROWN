'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {run,seedRandom,args}=require('../tools/simulate');
test('V2 simulator: seeded random sequence reproducible and in [0,1)',()=>{
 const x=seedRandom(37),y=seedRandom(37),a=Array.from({length:10},()=>x()),b=Array.from({length:10},()=>y());
 assert.deepEqual(a,b);assert.ok(a.every(v=>v>=0&&v<1));
});
test('V2 simulator: validates CLI options and rejects unknown inputs',()=>{
 assert.deepEqual(args(['--players','4','--games','2','--mode','standard','--seed','91']).players,4);
 assert.throws(()=>args(['--players','11']),/Invalid options/);
 assert.throws(()=>args(['--bots','unfair']),/Invalid options/);
 assert.throws(()=>args(['--surprise','yes']),/Unknown option/);
});
test('V2 simulator: two equivalent seeded game batches have identical scoreboards',()=>{
 const config=args(['--players','2','--games','3','--seed','9281','--mode','quick']);
 const a=run(config),b=run(config);
 assert.deepEqual(a,b);assert.equal(a.games,3);assert.equal(a.winPctBySeat.length,2);
 assert.ok(a.winnerPrestige.median>=0);
 assert.ok(a.firstPlacePrestigeTiePct>=0&&a.firstPlacePrestigeTiePct<=100);
});
test('V2 simulator: the random and mixed bot simulation variants execute',()=>{
 for(const bots of ['random','mixed']){
  const x=run(args(['--players','2','--games','1','--seed','299','--mode','standard','--bots',bots]));
  assert.equal(x.games,1);assert.ok(x.meanRoutesClaimed>=0);
 }
});
