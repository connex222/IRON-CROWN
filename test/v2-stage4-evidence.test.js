'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const data=(file)=>JSON.parse(fs.readFileSync(path.join(root,'docs/stage4-run',file),'utf8'));
test('Stage 4 recorded simulations: 2,000 games per two/four/eight-player case',()=>{
 for(const [file,n] of [['quick-2p-2000.json',2],['standard-4p-2000.json',4],['standard-8p-2000.json',8]]){
  const r=data(file);assert.equal(r.games,2000,file);assert.equal(r.metadata.players,n,file);
  assert.equal(r.metadata.seed,20261023,file);assert.equal(r.winPctBySeat.length,n,file);
  assert.ok(Math.abs(r.winPctBySeat.reduce((a,b)=>a+b,0)-100)<=.03,file);
 }
});
test('Stage 4 fairness evidence: four/eight-player seat limits and tie limit met',()=>{
 for(const [file,n,allowed] of [['standard-4p-2000.json',4,5],['standard-8p-2000.json',8,4]]){
  const r=data(file),fair=100/n;
  for(const pct of r.winPctBySeat)assert.ok(Math.abs(pct-fair)<=allowed,file+' '+pct);
  assert.ok(r.firstPlacePrestigeTiePct<8,file);
 }
});
test('Stage 4 balance report explicitly records unmet release gates',()=>{
 const four=data('standard-4p-2000.json');
 assert.ok(four.earlyTargetPct>50);
 assert.ok(four.winnersAtLeast80Pct<90);
 const report=fs.readFileSync(path.join(root,'docs/history/BALANCE-STAGE4.md'),'utf8');
 assert.match(report,/\*\*FAIL\*\*/);
 assert.match(report,/not yet.*certified|not.*certified|not.*final/i);
});
test('Stage 4 keeps only the eight approved human tycoon portraits and sound inventory',()=>{
 const ids=require('../src/constants').AVATARS.map(a=>a.id);
 const portraits=fs.readdirSync(path.join(root,'public/art/avatars')).filter(n=>n.endsWith('.png'));
 assert.deepEqual(portraits.sort(),ids.map(id=>id+'_human.png').sort());
 const sound=JSON.parse(fs.readFileSync(path.join(root,'public/audio/GENERATED-ASSETS.json')));
 assert.equal(sound.files.length,17);
});
test('Stage 4 cleaned documentation starts with the product title and retains history',()=>{
 const readme=fs.readFileSync(path.join(root,'README.md'),'utf8');
 assert.ok(readme.startsWith('# IRON CROWN\n'));
 assert.ok(fs.existsSync(path.join(root,'CHANGELOG.md')));
 assert.ok(fs.existsSync(path.join(root,'docs/history/01-iron-crown-v1-legacy.md')));
 assert.ok(fs.existsSync(path.join(root,'docs/history/QA-REPORT-V1.12.1.md')));
 assert.ok(fs.existsSync(path.join(root,'01-iron-crown.md')));
});
