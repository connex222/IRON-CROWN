'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const read=x=>JSON.parse(fs.readFileSync(path.join(ROOT,'docs/stage5-run',x),'utf8'));
test('Stage 5 Standard 4p: 2,000 sampled games satisfy all four design-review fairness gates',()=>{
 const r=read('standard-4p-2000.json');
 assert.equal(r.games,2000);assert.equal(r.metadata.target,22);assert.equal(r.metadata.maps,128);
 assert.ok(r.earlyTargetPct>=30&&r.earlyTargetPct<=50,r.earlyTargetPct);
 assert.ok(r.winnersAtLeast80Pct>=90,r.winnersAtLeast80Pct);
 assert.ok(r.firstPlacePrestigeTiePct<8,r.firstPlacePrestigeTiePct);
 for(const pct of r.winPctBySeat)assert.ok(Math.abs(pct-25)<=5,pct);
});
test('Stage 5 Standard 8p: 2,000 games meet starting-seat and prestige-tie gates',()=>{
 const r=read('standard-8p-2000.json');
 assert.equal(r.games,2000);assert.equal(r.metadata.maps,128);
 for(const pct of r.winPctBySeat)assert.ok(Math.abs(pct-12.5)<=4,pct);
 assert.ok(r.firstPlacePrestigeTiePct<8);
 assert.ok(r.winnersAtLeast80Pct>=90);
});
test('Stage 5 report honestly labels advanced pacing as unaccepted; live version remains v1',()=>{
 const report=fs.readFileSync(path.join(ROOT,'docs/history/BALANCE-STAGE5.md'),'utf8');
 assert.match(report,/Advanced scoring needs an independent balance decision/i);
 assert.match(report,/2000|2,000/);
 const notes=fs.readFileSync(path.join(ROOT,'docs/history/V2-STAGE-5.md'),'utf8');
 assert.match(notes,/not released|not.*deploy|production.*untouched|Render.*untouched/i);
});
