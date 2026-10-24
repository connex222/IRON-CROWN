'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=(name)=>JSON.parse(fs.readFileSync(path.resolve(__dirname,'../docs/stage11-run/',name),'utf8'));
function assertGates(s){
 assert.equal(s.games,2000);assert.equal(s.metadata.mode,'quick');assert.equal(s.metadata.players,4);assert.equal(s.metadata.maps,128);
 assert.ok(s.earlyTargetPct>=30&&s.earlyTargetPct<=50);
 assert.ok(s.winnersAtLeast80Pct>=90);
 assert.ok(s.firstPlacePrestigeTiePct<8);
 assert.equal(s.winPctBySeat.length,4);
 for(const n of s.winPctBySeat)assert.ok(n>=20&&n<=30);
}
test('Stage 11 four-player acceptance gates pass independently with seed 20261129',()=>{const s=read('quick4-2000-margin9.json');assert.equal(s.metadata.seed,20261129);assertGates(s);});
test('Stage 11 four-player acceptance gates pass independently with seed 20261201',()=>{const s=read('quick4-2000-independent.json');assert.equal(s.metadata.seed,20261201);assertGates(s);});
