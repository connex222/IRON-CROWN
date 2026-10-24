'use strict';
// Optional, bundled sound effects. Only explicitly documented basenames can be
// exposed to clients: arbitrary files and dotfiles are never listed.
const fs=require('node:fs');
const path=require('node:path');
const CUES=Object.freeze([
 'train-whistle','train-chug','steam-release','track-lay','depot-build',
 'city-build','coin-clink','dice-roll','clash-impact','crowd-gasp',
 'crowd-cheer','era-fanfare','victory-fanfare','ui-select','ui-confirm',
 'ambience-railway','music-parlour'
]);
const EXTRA_CUES=Object.freeze([
 'railway-switch','contract-stamp','trade-handshake','royal-ledger',
 'grand-station','ticket-complete','invalid-order','electric-era',
 'music-parlour-deluxe','music-five-lost-crowns'
]);
const EXTENSIONS=Object.freeze(['.ogg','.wav','.mp3']);
function availableAudio(directory){
 let files;try{files=new Set(fs.readdirSync(directory));}catch(e){if(e.code==='ENOENT')return[];throw e;}
 const out=[];
 for(const name of [...CUES,...EXTRA_CUES]){
  const filename=EXTENSIONS.map(ext=>name+ext).find(f=>files.has(f)&&fs.lstatSync(path.join(directory,f)).isFile());
  if(filename)out.push(filename);
 }
 return out;
}
module.exports={CUES,EXTRA_CUES,EXTENSIONS,availableAudio};
