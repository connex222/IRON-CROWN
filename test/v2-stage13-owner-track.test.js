'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path');
const {CUES,EXTRA_CUES,availableAudio}=require('../src/audio');
const root=path.resolve(__dirname,'..'),tv=fs.readFileSync(path.join(root,'public/tv.html'),'utf8');
const filename=path.join(root,'public/audio/music-five-lost-crowns.mp3');
test('Stage 13: supplied track integrity and complete 27-track inventory',()=>{
 assert.equal(CUES.length,17);assert.equal(EXTRA_CUES.length,10);
 assert.ok(EXTRA_CUES.includes('music-five-lost-crowns'));
 assert.equal(fs.statSync(filename).size,3800963);
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(filename)).digest('hex'),'137be7367127fc94615486c04c856067daed60f3c66d0be609e87c3f752626f2');
 const files=availableAudio(path.join(root,'public/audio'));
 assert.equal(files.length,27);
 assert.ok(files.includes('music-parlour-deluxe.mp3'));
 assert.ok(files.includes('music-parlour.mp3'));
});
test('Stage 13: soundtrack is first-choice, older songs back it up and music is host opt-in',()=>{
 const snippet=tv.slice(tv.indexOf('function startAudioLoops()'),tv.indexOf('function syncEngineAudio('));
 assert.ok(snippet.indexOf("'music-five-lost-crowns'")<snippet.indexOf("'music-parlour-deluxe'"));
 assert.match(snippet,/audio.addEventListener\('error'/);
 assert.match(tv,/currentMusicKey=parlourTrack/);
 assert.match(tv,/The Five Lost Crowns/);
 assert.match(tv,/muted=true; \/\/ Browsers require an explicit host gesture/);
 assert.ok(!/new Audio\('https?:/.test(tv));
});
