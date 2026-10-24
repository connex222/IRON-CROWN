#!/usr/bin/env node
'use strict';
// Evidence-led release gate. A historical passing result cannot override a
// failed current-mode result; external human acceptance is recorded separately.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const results=[];
const add=(name,pass,details,status=pass?'PASS':'FAIL')=>results.push({name,status,details});
function json(file){return JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));}
const scenarios=[
 {name:'Quick / 2 players',file:'docs/stage7-run/quick2-2000.json',mode:'quick',players:2,target:12},
 {name:'Quick / 4 players',file:'docs/stage8-run/quick-4p-2000.json',mode:'quick',players:4,target:12},
 {name:'Standard / 4 players',file:'docs/stage5-run/standard-4p-2000.json',mode:'standard',players:4,target:22},
 {name:'Standard / 8 players',file:'docs/stage5-run/standard-8p-2000.json',mode:'standard',players:8,target:22},
 {name:'Advanced / 4 players',file:'docs/stage7-run/advanced4-2000-gold5.json',mode:'advanced',players:4,target:24},
 {name:'Advanced / 8 players',file:'docs/stage9-run/advanced8-2000.json',mode:'advanced',players:8,target:24}
];
for(const scenario of scenarios){
 if(!fs.existsSync(path.join(root,scenario.file))){add(scenario.name,false,'Missing 2,000-game seeded simulation: '+scenario.file,'BLOCKED');continue;}
 let s;try{s=json(scenario.file);}catch(err){add(scenario.name,false,'Cannot parse result: '+err.message);continue;}
 const {mode,players,target,maps}=s.metadata;
 const issues=[];
 if(s.games<2000)issues.push('fewer than 2,000 games');
 if(mode!==scenario.mode||players!==scenario.players||target!==scenario.target)issues.push('scenario identity/target mismatch');
 if(maps<128)issues.push('fewer than 128 map templates');
 if(s.firstPlacePrestigeTiePct>=8)issues.push(`Prestige ties ${s.firstPlacePrestigeTiePct}%`);
 if(players===4){
  if(s.earlyTargetPct<30||s.earlyTargetPct>50)issues.push(`early victory ${s.earlyTargetPct}% (allowed 30–50%)`);
  if(s.winnersAtLeast80Pct<90)issues.push(`winner scoring consistency ${s.winnersAtLeast80Pct}% (minimum 90%)`);
 }
 if(players===8&&s.winnersAtLeast80Pct<90)issues.push(`winner scoring consistency ${s.winnersAtLeast80Pct}% (minimum 90%)`);
 const allowed=players===4?5:players===8?4:5;
 if(!Array.isArray(s.winPctBySeat)||s.winPctBySeat.length!==players||s.winPctBySeat.some(n=>Math.abs(n-100/players)>allowed))issues.push('seat fairness outside permitted range');
 add(scenario.name,issues.length===0,issues.length?issues.join('; '):`${s.games} games, seed ${s.metadata.seed}, early ${s.earlyTargetPct}%, 80%-score ${s.winnersAtLeast80Pct}%, ties ${s.firstPlacePrestigeTiePct}%`);
}
const soundDir=path.join(root,'public/audio');let soundIssues=[];
try{
 const entries=json('public/audio/GENERATED-ASSETS.json').files;
 if(entries.length!==17)soundIssues.push(`${entries.length}/17 files in manifest`);
 for(const e of entries){const file=path.join(soundDir,e.file);if(!fs.existsSync(file)){soundIssues.push('missing '+e.file);continue;}
 const digest=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
 if(digest!==e.sha256)soundIssues.push('mismatched checksum '+e.file);
 }
}catch(err){soundIssues.push(err.message);}
add('17 audio file checksums',!soundIssues.length,soundIssues.join('; ')||'17/17 SHA-256 hashes match');
const avatarDir=path.join(root,'public/art/avatars');
const avatars=['ada','augusta','ezra','jack','nell','ottoline','rupert','silas'];
const missing=avatars.filter(n=>!fs.existsSync(path.join(avatarDir,n+'_human.png')));
add('Eight original portraits',missing.length===0,missing.length?'Missing '+missing.join(', '):'8/8 original portraits present');
const screenshotsDir=path.join(root,'docs/stage7-run/browser');
const screenCount=fs.existsSync(screenshotsDir)?fs.readdirSync(screenshotsDir).filter(n=>n.endsWith('.png')).length:0;
add('Browser fixture screenshots',screenCount>=32,`${screenCount} screenshots captured; fixtures do not certify real devices`,screenCount>=32?'PASS':'BLOCKED');
let wsVersion='unavailable';try{wsVersion=require('ws/package.json').version;}catch{}
const modernWs=wsVersion!=='unavailable'&&wsVersion.split('.').map(Number)[0]===8&&Number(wsVersion.split('.')[1])>=22;
add('Installed WebSocket runtime',modernWs,'ws '+wsVersion,modernWs?'PASS':'BLOCKED');
// External licence and device evidence is deliberately never inferred from a
// successful checksum, fixture rendering or robot simulation.
add('Commercial audio redistribution licence',false,'Provider terms/rights not independently verified','BLOCKED');
add('Physical-device and cross-network acceptance',false,'November acceptance testing outstanding','BLOCKED');
add('Hosting durability and rollback rehearsal',false,'Ephemeral Render storage and browser-only recovery not certified','BLOCKED');
const failed=results.filter(r=>r.status!=='PASS');
if(require.main===module){
 for(const r of results)console.log(`${r.status.padEnd(7)} ${r.name} — ${r.details}`);
 console.log(`\nRelease gates: ${results.length-failed.length} passed, ${failed.length} failed/blocked. Production approval: NO.`);
 if(process.env.RELEASE_PREFLIGHT_JSON)fs.writeFileSync(process.env.RELEASE_PREFLIGHT_JSON,JSON.stringify({version:require('../package.json').version,results,passed:results.length-failed.length,blocked:failed.length,releaseApproved:false},null,2)+'\n');
 if(failed.length)process.exitCode=1;
}
module.exports={results,failed,scenarios};
