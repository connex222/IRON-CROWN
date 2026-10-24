'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..');
const tv=fs.readFileSync(path.join(ROOT,'public/tv.html'),'utf8');
const phone=fs.readFileSync(path.join(ROOT,'public/phone.html'),'utf8');
const scripts=html=>[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const styles=html=>html.split('<style>')[1]?.split('</style>')[0]||'';
const t=scripts(tv)[0],p=scripts(phone)[0];
function luminance(hex){
 const x=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255)
  .map(n=>n<=.04045?n/12.92:Math.pow((n+.055)/1.055,2.4));
 return x[0]*.2126+x[1]*.7152+x[2]*.0722;
}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
test('Cross-device: TV and phone handbook scripts compile on their own without a CDN',()=>{
 assert.equal(scripts(tv).length,1);assert.equal(scripts(phone).length,1);
 new vm.Script(t,{filename:'tv.html'});new vm.Script(p,{filename:'phone.html'});
 assert.ok(!/<script[^>]+src="https?:/i.test(tv+phone));
});
test('Cross-device: How to Play is prominent from the TV, lobby and phone join screen',()=>{
 assert.match(tv,/id="rulesBtn"[^>]*How to Play/);
 assert.match(tv,/id="heroHowTo"/);
 assert.match(tv,/id="heroLore"/);
 assert.match(phone,/id="rules"[^>]*How to Play/);
 assert.match(phone,/id="joinHelp"/);
 assert.match(phone,/id="storyBtn"/);
 assert.match(p,/function openPocketGuide\(page='start'\)/);
 assert.match(t,/function openGuide\(section='quick'\)/);
});
test('Cross-device: three steps, seven action costs, Prestige and private-ticket advice are explained',()=>{
 for(const name of ['Join &amp; claim','Plan three orders','Watch the reveal'])assert.ok(t.includes(name),name);
 for(const name of ['Build Depot','Upgrade to City','Lay Track','Recruit','Trade','Research','Attack'])assert.ok(t.includes(name));
 assert.match(t,/12 Prestige/);assert.match(t,/20/);assert.match(t,/22/);
 assert.match(p,/12 Prestige in Quick/);
 assert.match(p,/keep 2 or 3 private Destination Tickets/i);
 assert.match(p,/shared 20-second Exchange/);
});
test('Lore is clearly fictional while history has correctly scoped Victorian milestones',()=>{
 assert.match(t,/Fictional kingdom/);
 assert.match(t,/The Crown Without a King/);
 assert.match(p,/kingdom and its eight tycoons are fictional/);
 assert.match(t,/15 September 1830/);
 assert.match(t,/1856/);
 assert.match(t,/1880s/);
 assert.match(p,/Science Museum Group and London Museum/);
 assert.ok(!t.includes('fictional kingdom is real'));
});
test('Responsive TV and PC: the shared map and navigation have large/small screen layouts',()=>{
 const css=styles(tv);
 assert.match(css,/@media\(min-width:1600px\)/);
 assert.match(css,/@media\(max-width:1050px\)/);
 assert.match(css,/@media\(max-width:720px\)/);
 assert.match(css,/\.game-layout\{display:flex;flex-direction:column/);
 assert.match(css,/\.guide-tabs\{display:flex;flex-wrap:wrap/);
 assert.match(css,/\.guide-modal\{width:min\(1060px/);
 assert.match(tv,/id="galleryBtn"/);
 assert.match(tv,/id="soundBtn"/);
});
test('Responsive phone, tablet and PC: small controls, handbook tabs and zoom work',()=>{
 const css=styles(phone);
 assert.match(phone,/viewport-fit=cover/);
 assert.ok(!phone.includes('maximum-scale=1'),'Do not disable user zoom');
 assert.match(css,/@media\(min-width:820px\)/);
 assert.match(css,/@media\(max-width:500px\)/);
 assert.match(css,/\.pocket-tabs\{display:grid;grid-template-columns:repeat\(2/);
 assert.match(css,/\.phone-help-actions button\{min-height:48px/);
 assert.match(css,/\.pocket-guide-step p\{font-size:16px/);
 assert.match(p,/aria-pressed/);
});
test('Sound: TV has all 17 bundled cues and phone plays strictly opt-in local UI recordings',()=>{
 const {CUES,availableAudio}=require('../src/audio');
 const files=availableAudio(path.join(ROOT,'public/audio'));
 assert.equal(CUES.length,17);assert.equal(files.length,17);
 assert.match(t,/function playCue\(key\)/);
 assert.match(t,/function startAudioLoops\(\)/);
 assert.match(t,/const MIX_PRESETS=/);
 assert.match(phone,/id="phoneSoundBtn"[^>]*aria-pressed="false"/);
 assert.match(p,/let phoneAudioEnabled=false/);
 assert.match(p,/localStorage\.getItem\('ironPhoneSound'\)==='on'/);
 assert.match(p,/if\(!phoneAudioEnabled\|\|!PHONE_CUES\.has\(key\)/);
 assert.match(p,/new Audio\('\/audio\/'\+key\+'\.mp3'\)/);
 assert.match(p,/playPhoneCue\('dice-roll'\)/);
 assert.match(p,/playPhoneCue\('ui-confirm'\)/);
 assert.match(p,/if\(!phoneAudioEnabled&&phoneLastAudio\)/);
});
test('Readability: both default parchment accents meet AA text contrast without changing dark mode',()=>{
 const foreground='#866313';
 assert.ok(contrast(foreground,'#fff6e5')>=4.5);
 assert.ok(contrast(foreground,'#fff5e2')>=4.5);
 assert.ok(styles(tv).includes('--gold:#866313'));
 assert.ok(styles(phone).includes('--brass:#866313'));
 assert.match(styles(tv),/prefers-color-scheme:dark/);
 assert.match(styles(phone),/prefers-color-scheme:dark/);
});
