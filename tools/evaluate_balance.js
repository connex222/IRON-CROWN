#!/usr/bin/env node
'use strict';
// Standards from the independent v2 design review. Evidence only; exit 0 by
// default so an unfinished *development* build can be inspected honestly.
const fs=require('node:fs');
const files=process.argv.slice(2);
if(!files.length){console.error('Usage: node tools/evaluate_balance.js docs/stage4-run/*.json');process.exit(2);}
const report=[];
for(const file of files){
 const s=JSON.parse(fs.readFileSync(file,'utf8'));
 if(s.games<2000)throw Error(`${file}: not a >=2,000-game fairness sample`);
 const {players,mode}=s.metadata,seatReference=100/players,range=players===4?5:players===8?4:null;
 const checks=[];
 if(range!==null)checks.push({criterion:`Seat win rates within ±${range} percentage points of ${seatReference}%`,pass:s.winPctBySeat.every(rate=>Math.abs(rate-seatReference)<=range),measured:s.winPctBySeat.join('% / ')+'%'});
 if(players===4){
  checks.push({criterion:'Early target reached before final round, 30–50%',pass:s.earlyTargetPct>=30&&s.earlyTargetPct<=50,measured:s.earlyTargetPct+'%'});
  checks.push({criterion:'Winner achieves >=80% target in >=90% games',pass:s.winnersAtLeast80Pct>=90,measured:s.winnersAtLeast80Pct+'%'});
 }
 checks.push({criterion:'First-place Prestige tie rate under 8%',pass:s.firstPlacePrestigeTiePct<8,measured:s.firstPlacePrestigeTiePct+'%'});
 report.push({mode,players,games:s.games,mean:s.winnerPrestige.mean,median:s.winnerPrestige.median,earlyPct:s.earlyTargetPct,at80Pct:s.winnersAtLeast80Pct,tiePct:s.firstPlacePrestigeTiePct,seatRates:s.winPctBySeat,checks});
}
for(const data of report){
 console.log(`\n${data.mode.toUpperCase()} — ${data.players} players — ${data.games.toLocaleString()} games`);
 for(const c of data.checks)console.log(`${c.pass?'PASS':'FAIL'} ${c.criterion}: ${c.measured}`);
}
const failed=report.flatMap(x=>x.checks).filter(x=>!x.pass);
console.log(`\nDesign review gates: ${report.flatMap(x=>x.checks).length-failed.length} passed, ${failed.length} failed`);
// Dev report remains available even when fairness is not yet certified.
if(process.env.BALANCE_REPORT_JSON)fs.writeFileSync(process.env.BALANCE_REPORT_JSON,JSON.stringify({report,failed:failed.length},null,2)+'\n');
if(process.env.REQUIRE_BALANCE_PASS==='1'&&failed.length)process.exitCode=1;
