'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../public/tv.html'),'utf8');
const script=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)][0][1];
const start=script.indexOf('const SOUND_GAIN='),end=script.indexOf('let soundManifest=',start);
if(start<0||end<0)throw Error('Missing sound mix policies');
const {SOUND_GAIN,MIX_PRESETS}=vm.runInNewContext(script.slice(start,end)+'\n({SOUND_GAIN,MIX_PRESETS})');

test('Audio mix: every bundled cue has a calibrated gain and priority',()=>{
 const {CUES}=require('../src/audio');
 assert.deepEqual(Object.keys(SOUND_GAIN).sort(),[...CUES].sort());
 for(const [k,cue] of Object.entries(SOUND_GAIN)){
  assert.ok(cue.gain>0&&cue.gain<=.7,k);
  assert.ok(Number.isInteger(cue.priority)&&cue.priority>=0&&cue.priority<=6,k);
  assert.ok(Number.isInteger(cue.gap)&&cue.gap>=0,k);
 }
 assert.ok(SOUND_GAIN['victory-fanfare'].priority>SOUND_GAIN['ui-select'].priority);
 assert.ok(SOUND_GAIN['clash-impact'].priority>SOUND_GAIN['coin-clink'].priority);
});
test('Audio mix: three profiles adjust separate FX, music and railway ambience buses',()=>{
 assert.deepEqual(Object.keys(MIX_PRESETS).sort(),['balanced','cinematic','quiet']);
 for(const key of ['fx','music','ambience']){
  const v=['quiet','balanced','cinematic'].map(k=>MIX_PRESETS[k][key]);
  assert.ok(v.every(x=>x>0&&x<.8));
  assert.ok(v[0]<v[1]&&v[1]<v[2]);
 }
});
test('Audio mix: muting stops current effects and all background loops',()=>{
 assert.match(script,/function stopEffects\(\)[\s\S]*?activeEffects\.clear\(\)/);
 assert.match(script,/muted=true;stopEffects\(\);stopAudioLoops\(\)/);
 assert.match(script,/muted=true; \/\/ Browsers require an explicit host gesture/);
 assert.match(script,/document\.addEventListener\('visibilitychange'/);
});
test('Audio mix: dramatic reveals smoothly duck background audio',()=>{
 assert.ok(SOUND_GAIN['victory-fanfare'].duck>=7000);
 assert.ok(SOUND_GAIN['clash-impact'].duck>=1800);
 assert.match(script,/function duckMusic\(ms\)/);
 assert.match(script,/duckUntil=Math\.max\(duckUntil,Date\.now\(\)\+ms\)/);
 assert.match(script,/const target=Date\.now\(\)<duckUntil \? \.26 : 1/);
 assert.match(script,/musicVolume\*SOUND_GAIN\['music-parlour'\]\.gain\*smoothedDuck/);
});
test('Audio mix: at most three effects play and higher priority wins',()=>{
 assert.match(script,/if\(activeEffects\.size>=3\)/);
 assert.match(script,/if\(!weakest\|\|weakest\.priority>=cue\.priority\)return/);
 assert.match(script,/weakest\.audio\.pause\(\);activeEffects\.delete\(weakest\)/);
 assert.match(script,/lastCueAt\.get\(key\)/);
});
test('Audio mix: separate sliders and preview selector are wired to live volumes',()=>{
 for(const label of ['Sound effects','Music','Railway ambience'])assert.ok(script.includes(label));
 for(const id of ['masterVol','musicVol','ambienceVol','mixPreset','previewCue'])assert.ok(script.includes(id));
 assert.match(script,/mixProfile='custom';updateInputs\(\)/);
 assert.match(script,/const value=trimGain\(Number\(e\.target\.value\)\/100\)/);
 new vm.Script(script);
});
test('Audio mix: playback is same-origin and retains fallback on load failure',()=>{
 assert.match(script,/fetch\('\/audio\/manifest\.json'/);
 assert.match(script,/new Audio\('\/audio\/'\+filename\)/);
 assert.match(script,/new Audio\('\/audio\/'\+file\)/);
 assert.match(script,/audio\.play\(\)\.catch\(\(\)=>\{releaseEffect\(effect\);if\(!muted\)synthCue\(key\)/);
 assert.ok(!/new Audio\('https?:/.test(script));
});

test('Audio mix: fresh install has Balanced selected, audition plays only selected cue and inventory can scan silently',()=>{
 assert.match(script,/Object\.keys\(cfg\)\.length\?'custom':'balanced'/);
 assert.match(script,/async function toggleAudio\(skipWelcome=false\)/);
 assert.match(script,/if\(!skipWelcome\)playCue\('train-whistle'\)/);
 assert.match(script,/if\(muted\)\{await toggleAudio\(true\)\}/);
 assert.match(script,/if\(!soundManifestReady\)scanBundledAudio\(\)\.then\(/);
});
