'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=(seed)=>JSON.parse(fs.readFileSync(path.join(__dirname,'../docs/stage12-run/quick8-2000-seed'+seed+'.json'),'utf8'));
for(const seed of [20261212,20261214]){
 test('Stage 12 eight-player Quick formal fairness gates: '+seed,()=>{
  const s=read(seed);
  assert.equal(s.games,2000);assert.equal(s.metadata.games,2000);
  assert.equal(s.metadata.players,8);assert.equal(s.metadata.mode,'quick');assert.equal(s.metadata.seed,seed);
  assert.equal(s.metadata.maps,128);assert.equal(s.metadata.target,12);assert.equal(s.metadata.bots,'greedy');
  assert.equal(s.winPctBySeat.length,8);
  for(const share of s.winPctBySeat)assert.ok(share>=8.5&&share<=16.5,'seat share '+share);
  assert.ok(s.firstPlacePrestigeTiePct<8);
  assert.ok(s.earlyTargetPct>=0&&s.earlyTargetPct<=100);
 });
}
