#!/usr/bin/env node
'use strict';
// Development tuning utility. Resets the in-memory target per experiment;
// does not edit the game rules or modify a repository file.
const fs=require('node:fs');
const {run,args}=require('./simulate'),{MODE}=require('../src/constants');
const n=Number(process.argv[2]||90);
const configs=[
 ['quick',4,12],['quick',4,14],['quick',4,16],
 ['standard',4,20],['standard',4,22],['standard',4,24],
 ['advanced',4,20],['advanced',4,23],['advanced',4,26]
];
const lines=[];
for(const [mode,players,target] of configs){
 MODE[mode].target=target;
 const r=run(args(['--mode',mode,'--players',String(players),'--games',String(n),'--seed','20261023']));
 const out={mode,players,target,games:n,earlyPct:r.earlyTargetPct,above80Pct:r.winnersAtLeast80Pct,median:r.winnerPrestige.median,tiePct:r.firstPlacePrestigeTiePct,seats:r.winPctBySeat};
 lines.push(out);console.log(JSON.stringify(out));
}
fs.writeFileSync(require('node:path').join(__dirname,'..','docs','balance-calibration.json'),JSON.stringify(lines,null,2)+'\n');
