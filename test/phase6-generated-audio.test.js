'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {CUES,EXTRA_CUES,availableAudio}=require('../src/audio');
const root=path.join(__dirname,'..','public','audio');
const inventory=JSON.parse(fs.readFileSync(path.join(root,'GENERATED-ASSETS.json'),'utf8'));

test('Generated sound pack installs all 17 exact allowlisted local MP3 names',()=>{
 assert.equal(inventory.files.length,17);
 assert.equal(new Set(inventory.files.map(x=>x.file)).size,17);
 assert.deepEqual(availableAudio(root).filter(x=>CUES.some(k=>x===k+'.mp3')).sort(),CUES.map(x=>x+'.mp3').sort());
 assert.ok(availableAudio(root).every(x=>[...CUES,...EXTRA_CUES].some(k=>x===k+'.mp3')));
});
test('Every generated audio file matches the production checksum and contains MP3 frames',()=>{
 for(const entry of inventory.files){
  const file=path.join(root,entry.file);
  const data=fs.readFileSync(file);
  assert.ok(data.length>2000,entry.file);
  assert.equal(data.length,entry.size_bytes,entry.file);
  assert.equal(crypto.createHash('sha256').update(data).digest('hex'),entry.sha256,entry.file);
  assert.match(entry.file,/^[a-z-]+\.mp3$/);
  const id3=data.toString('ascii',0,3)==='ID3';
  const mpeg=data[0]===0xff&&(data[1]&0xe0)===0xe0;
  assert.ok(id3||mpeg,entry.file+' is not an MP3');
  assert.ok(entry.duration_seconds>0&&entry.duration_seconds<=90,entry.file);
  assert.ok([44100,48000,32000,22050].includes(entry.sample_rate),entry.file);
 }
});
test('Only the two requested creation services are recorded and game sound contains no external audio URLs',()=>{
 assert.equal(inventory.files.filter(x=>x.provider==='Mirelo').length,16);
 assert.equal(inventory.files.filter(x=>x.provider==='Sonilo').length,1);
 const tv=fs.readFileSync(path.join(__dirname,'..','public','tv.html'),'utf8');
 assert.ok(tv.includes("fetch('/audio/manifest.json'"));
 assert.ok(tv.includes("new Audio('/audio/'+file)"));
 assert.ok(!tv.includes('https://mirelo.ai/dl/'));
 assert.ok(!tv.includes('https://api.sonilo.com/files/'));
});
