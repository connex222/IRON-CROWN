'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {CUES,EXTRA_CUES,availableAudio}=require('../src/audio');
const base=path.join(__dirname,'..');
const tv=fs.readFileSync(path.join(base,'public/tv.html'),'utf8');
const phone=fs.readFileSync(path.join(base,'public/phone.html'),'utf8');
test('Stage 10 never loses the licensed originals or the allowlist',()=>{
 assert.equal(CUES.length,17);assert.equal(EXTRA_CUES.length,9);
 const assets=availableAudio(path.join(base,'public/audio'));
 for(const k of CUES)assert.ok(assets.includes(k+'.mp3'),k);
 assert.ok(assets.every(x=>[...CUES,...EXTRA_CUES].some(k=>x.startsWith(k+'.'))));
});
test('New cues are present and recorded sound fallback is safe',()=>{
 for(const key of EXTRA_CUES){assert.ok(tv.includes("'"+key+"'"),key);}
 for(const cue of ['ticket-complete','trade-handshake','invalid-order'])assert.ok(phone.includes(cue));
 assert.ok(tv.includes('studioMasterPath(filename)'));
 assert.ok(tv.includes("soundManifest.has('music-parlour-deluxe')"));
 assert.ok(!tv.includes('https://mirelo.ai/dl/'));assert.ok(!tv.includes('https://gen.daydream.live/'));
});
test('No provider URL is needed at runtime and music remains user-opt-in',()=>{
 assert.match(tv,/muted=true; \/\/ Browsers require an explicit host gesture/);
 assert.match(phone,/phoneAudioEnabled=localStorage.getItem\('ironPhoneSound'\)==='on'/);
 assert.ok(!/new Audio\('https?:/.test(tv+phone));
});
