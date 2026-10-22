'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const vm=require('node:vm');
const {CUES,EXTENSIONS,availableAudio}=require('../src/audio');
const ROOT=path.resolve(__dirname,'..');
const tv=fs.readFileSync(path.join(ROOT,'public','tv.html'),'utf8');
const server=fs.readFileSync(path.join(ROOT,'src','server.js'),'utf8');
test('Phase 6: exactly 17 safe local sound cues are declared',()=>{
 assert.equal(CUES.length,17);assert.equal(new Set(CUES).size,CUES.length);
 for(const k of CUES)assert.match(k,/^[a-z]+(?:-[a-z]+)*$/);
 assert.deepEqual(EXTENSIONS,['.ogg','.wav','.mp3']);
});
test('Phase 6: optional sound scanning uses exact allowlisted names and prefers OGG',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'iron-audio-'));
 try{
  fs.writeFileSync(path.join(dir,'coin-clink.mp3'),'fake');
  fs.writeFileSync(path.join(dir,'coin-clink.ogg'),'fake');
  fs.writeFileSync(path.join(dir,'clash-impact.wav'),'fake');
  fs.writeFileSync(path.join(dir,'secret-test.ogg'),'fake');
  fs.writeFileSync(path.join(dir,'.hidden.ogg'),'fake');
  assert.deepEqual(availableAudio(dir),['coin-clink.ogg','clash-impact.wav']);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('Phase 6: missing audio is a supported fallback, without server failure',()=>{
 assert.deepEqual(availableAudio(path.join(os.tmpdir(),'absent-iron-crown-no-audio')),[]);
});
test('Phase 6: server dynamically enumerates bundled audio and serves correct MIME',()=>{
 assert.ok(server.includes("pathname==='/audio/manifest.json'"));
 assert.ok(server.includes("'.ogg':'audio/ogg'"));
 assert.ok(server.includes("'.mp3':'audio/mpeg'"));
 assert.ok(server.includes("availableAudio(path.join(ROOT,'audio'))"));
});
test('Phase 6: game UI script compiles and has audio mixer, motion reduction and cinematic features',()=>{
 const scripts=[...tv.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
 assert.equal(scripts.length,1);
 new vm.Script(scripts[0]);
 for(const id of ['cinemaLayer','eraCurtain','cinemaFlash','cinemaLive','audioSettingsBtn','soundBtn'])assert.ok(tv.includes('id="'+id+'"'),id);
 for(const symbol of ['startEraSequence','spotlightAction','flashBoard','showActorNotice','scanBundledAudio','startAudioLoops','playCue','synthCue'])assert.ok(tv.includes('function '+symbol),symbol);
 assert.match(tv,/prefers-reduced-motion:reduce/);
 assert.match(tv,/\.cinema-dice/);
 assert.match(tv,/engine-smoke/);
 assert.ok(!tv.includes('cdn.'));
});
test('Phase 6: sound is muted by default until deliberately enabled',()=>{
 assert.match(tv,/muted=true/);assert.match(tv,/\$\('soundBtn'\)\.onclick=async/);
 assert.match(tv,/soundManifest\.get\(key\)/);
 assert.match(tv,/setAttribute\('aria-pressed',String\(!muted\)\)/);
});
