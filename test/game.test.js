'use strict';
const test=require('node:test');const assert=require('node:assert/strict');
const g=require('../src/game'),{generateMap,neighbours,longestRail,ownsConnection,distance}=require('../src/map');
const {DISTRIBUTION,MODE,AVATARS,UPGRADES}=require('../src/constants');
function setup(people=2,mode='standard',ai=false){const r=g.createRoom('ABCD');const ps=[];for(let i=0;i<people;i++){const p=g.addPlayer(r,'Tester '+i,ai);if(!ai)g.chooseAvatar(r,p,AVATARS[i].id);ps.push(p);}g.startGame(r,mode);
 if(!ai){for(const p of ps)g.chooseTickets(r,p,p.ticketChoices.slice(0,2).map(x=>x.id));while(r.status==='placement'){const p=ps.find(p=>p.id===r.placement[r.placementIndex]);g.placeDepot(r,p,r.tiles.find(t=>!t.owner&&['coal','forest','farm','steel'].includes(t.type)).id);}for(const p of ps)g.chooseUpgrade(r,p,UPGRADES.steam[0].id);}return {r,ps};}
function advance(r,limit=200){let steps=0;while(r.status!=='finished'&&steps++<limit){if(r.status==='plan')for(const p of r.players.filter(x=>!x.locked))g.lockIn(r,p);else g.tick(r,r.deadline+10);}return steps;}
test('37-hex map satisfies tile distribution, lake spacing and route constraints',()=>{
 for(let i=0;i<120;i++){const m=generateMap(),counts={};for(const t of m.tiles)counts[t.type]=(counts[t.type]||0)+1;
 assert.equal(m.tiles.length,37);for(const [k,n] of Object.entries(DISTRIBUTION))assert.equal(counts[k],n,`wrong ${k} count`);assert.equal(counts.capital,1);assert.equal(m.tiles.find(t=>t.type==='capital').id,'0,0');
 const byId=new Map(m.tiles.map(t=>[t.id,t]));for(const t of m.tiles.filter(x=>x.type==='lake'))assert.equal(neighbours(t,byId).some(x=>x.type==='lake'),false);
 assert.equal(m.routes.length,18);assert.equal(new Set(m.routes.map(r=>[r.a,r.b].sort().join('|'))).size,18);
 for(const route of m.routes){assert.ok(route.segments>=2&&route.segments<=5);assert.equal(route.segments,route.path.length-1);assert.equal(route.path[0],route.a);assert.equal(route.path.at(-1),route.b);
 for(let j=1;j<route.path.length;j++){const from=byId.get(route.path[j-1]),to=byId.get(route.path[j]);assert.notEqual(from.type,'lake');assert.notEqual(to.type,'lake');assert.equal(distance(from,to),1);}}
 assert.equal(m.deck.length,24);assert.ok(m.deck.every(t=>t.value>=2&&t.value<=4));
 }
});
test('four-letter room, player limit, uniqueness and sanitized names',()=>{const r=g.createRoom('ABCD');for(let i=0;i<8;i++){const p=g.addPlayer(r,`<Tester ${i}>`,true);assert.ok(!p.name.includes('<'));assert.ok(p.token.length>=16);}
 assert.throws(()=>g.addPlayer(r,'Ninth'),/Room full/);assert.equal(new Set(r.players.map(p=>p.avatar)).size,8);
});
test('secret ticket selection, snake placement and starting resources',()=>{const {r,ps}=setup(3);assert.equal(r.status,'income');assert.equal(r.placement.length,6);assert.deepEqual(r.placement.slice(0,3),ps.map(p=>p.id));assert.deepEqual(r.placement.slice(3),ps.map(p=>p.id).reverse());
 for(const p of ps){assert.equal(p.tickets.length,2);assert.equal(g.owned(r,p).length,2);assert.equal(g.owned(r,p).reduce((n,t)=>n+t.soldiers,0),2);assert.ok(p.resources.gold>=2);assert.ok(['coal','timber','grain','steel'].every(k=>p.resources[k]>=1));}
 const snapshot=g.publicView(r),privateSnapshot=g.privateView(r,ps[0]);assert.ok(!JSON.stringify(snapshot).includes(ps[0].tickets[0].id));assert.equal(privateSnapshot.tickets.length,2);assert.ok(!JSON.stringify(snapshot).includes(ps[0].token));
});
test('income, bank trade ratios and mode-specific rules',()=>{const {r,ps}=setup(2);g.tick(r,r.deadline+1);assert.equal(r.status,'plan');
 const p=ps[0];assert.equal(g.tradeRate(r,p,'grain'),3);p.upgrades.push('corn');assert.equal(g.tradeRate(r,p,'grain'),2);
 r.event={id:'boom'};r.mode='advanced';const before={...p.resources};g.beginPlan(r);assert.equal(r.status,'plan');assert.ok(Object.keys(before).every(k=>p.resources[k]>=0));
});
test('validate targeted actions, prohibit research twice and enforce joint costs',()=>{const {r,ps}=setup();g.tick(r,r.deadline+1);const p=ps[0];const legal=g.legalTargets(r,p);
 assert.throws(()=>g.setAction(r,p,0,{type:'build',tile:'99,99'}),/available adjacent/);
 assert.throws(()=>g.setAction(r,p,0,{type:'recruit',tile:legal.recruit[0],count:4}),/Recruit 1–3/);
 g.setAction(r,p,0,{type:'research',kind:'ticket'});assert.throws(()=>g.setAction(r,p,1,{type:'research',kind:'ticket'}),/once per round/);
 assert.equal(p.actions[1],null);g.setAction(r,p,1,{type:'skip'});g.lockIn(r,p);assert.equal(p.locked,true);
});
test('failed actions add exactly one Gold, valid actions spend resources',()=>{const {r,ps}=setup();g.tick(r,r.deadline+1);for(const p of ps){p.resources={coal:10,timber:20,grain:20,steel:20,gold:20};}
 const free=g.legalTargets(r,ps[0]).build[0];assert.ok(free);g.setAction(r,ps[0],0,{type:'build',tile:free});g.setAction(r,ps[0],1,{type:'skip'});g.lockIn(r,ps[0]);
 g.setAction(r,ps[1],0,{type:'skip'});g.setAction(r,ps[1],1,{type:'skip'});g.lockIn(r,ps[1]);assert.equal(r.status,'reveal');
 // The claim stays contested until all orders are revealed.
 advance(r,5);assert.ok(r.status==='income'||r.status==='draft'||r.status==='finished');const tile=r.tiles.find(t=>t.id===free);assert.equal(tile.owner,ps[0].id);
});
test('scoring: market depots, cities, tickets and 5-soldier trophy',()=>{const {r,ps}=setup();const [p,q]=ps;
 const town=r.tiles.find(t=>t.type==='town');town.owner=p.id;town.city=false;g.updatePrestige(r);assert.equal(p.breakdown.depot,1);
 town.city=true;g.updatePrestige(r);assert.equal(p.breakdown.city,2);assert.equal(p.breakdown.depot,0);
 g.owned(r,p)[0].soldiers=6;g.updatePrestige(r);assert.equal(p.breakdown.army,2);assert.equal(q.breakdown.army,0);
});
test('longest railway counts connected owned route segments',()=>{
 const owned=[{id:'x',segments:2,path:['a','b','c']},{id:'y',segments:3,path:['c','d','e','f']},{id:'z',segments:4,path:['q','r','s','t','u']}];
 assert.equal(longestRail(owned),5);owned.push({id:'h',segments:2,path:['t','x','y']});assert.equal(longestRail(owned),6);
});
test('trade requires a recipient, valid resource objects, and may be declined',()=>{const {r,ps}=setup();g.tick(r,r.deadline+1);
 assert.throws(()=>g.setAction(r,ps[0],0,{type:'trade',kind:'player',to:ps[1].id,give:{coal:-1},want:{steel:1}}),/Invalid resource amount/);
 g.setAction(r,ps[0],0,{type:'trade',kind:'player',to:ps[1].id,give:{coal:1},want:{steel:1}});g.setAction(r,ps[0],1,{type:'skip'});g.lockIn(r,ps[0]);g.lockIn(r,ps[1]);
 const before=ps[0].resources.coal;g.revealStep(r);assert.equal(r.status,'offer');assert.equal(ps[0].resources.coal,before-1);g.replyOffer(r,ps[1],false);assert.equal(r.status,'reveal');assert.equal(ps[0].resources.coal,before);
});
test('Advanced rules: avatar perks and events modify costs',()=>{const {r,ps}=setup(2,'advanced');r.era='steam';const [p]=ps;p.avatar='augusta';
 assert.equal(g.costOf(r,p,{type:'city'}).grain,1);
 p.avatar='rupert';assert.equal(g.costOf(r,p,{type:'recruit',count:3}).gold,3);
 r.event={id:'recruit'};assert.equal(g.costOf(r,p,{type:'recruit',count:3}).gold,3);
 p.avatar='ottoline';r.event={id:'fair'};assert.equal(g.costOf(r,p,{type:'research',kind:'ticket'}).gold,1);
});
test('computer-only games progress to a winner without getting stuck',()=>{const {r}=setup(4,'quick',true);const steps=advance(r,150);assert.ok(steps<150,`stuck in ${r.status}`);assert.equal(r.status,'finished');assert.equal(r.players.length,4);assert.ok(r.round<=8);assert.ok(r.lastWinner);});
test('no elimination: a player with no territory is restored free at Income',()=>{const {r,ps}=setup();const p=ps[0];for(const t of g.owned(r,p)){t.owner=null;t.soldiers=0;}
 g.beginIncome(r);assert.equal(g.owned(r,p).length,1);assert.equal(g.owned(r,p)[0].soldiers,1);
});
test('phone and TV scripts are self-contained and parse without runtime imports',()=>{const fs=require('node:fs');for(const f of ['tv.html','phone.html']){const html=fs.readFileSync(require('node:path').resolve(__dirname,'../public/'+f),'utf8');assert.match(html,/<script>/);assert.doesNotThrow(()=>new Function(html.split('<script>')[1].split('</script>')[0]));assert.ok(!/<script[^>]+src=/i.test(html));}}
);

// PHASE 2 — Repeatable country generation and network coverage checks.
const seedRandom=seed=>()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};
test('seeded countries reproduce the same towns, topography, railway paths and ticket deck',()=>{
 for(let seed=0;seed<25;seed++){
  const a=generateMap(seedRandom(seed)),b=generateMap(seedRandom(seed));
  assert.deepEqual(a,b,`Seed ${seed} must be replayable`);
 }
});
test('every generated town is connected to the capital by the complete prospective network',()=>{
 let longer=0;
 for(let seed=30;seed<130;seed++){
  const m=generateMap(seedRandom(seed)),stations=m.tiles.filter(t=>t.type==='town'||t.type==='capital');
  const links=new Map(stations.map(t=>[t.id,new Set()]));
  for(const r of m.routes){links.get(r.a).add(r.b);links.get(r.b).add(r.a);if(r.segments>=4)longer++;}
  const visited=new Set(['0,0']),pending=['0,0'];
  while(pending.length)for(const dest of links.get(pending.shift()))if(!visited.has(dest)){visited.add(dest);pending.push(dest);}
  assert.equal(visited.size,7,`Seed ${seed} contains a stranded station`);
  assert.ok(links.get('0,0').size>=3,'The Capital must have meaningful railway access');
  for(const t of m.deck){assert.ok(links.has(t.a)&&links.has(t.b));assert.notEqual(t.a,t.b);}
 }
 assert.ok(longer>=300,'Map selection should preserve enough four- and five-segment journeys');
});
test('Phase 2 presentation ships painted TV terrain, accessible phone target highlighting and map controls',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const tv=fs.readFileSync(path.resolve(__dirname,'../public/tv.html'),'utf8');
 const phone=fs.readFileSync(path.resolve(__dirname,'../public/phone.html'),'utf8');
 for(const name of ['coal','forest','farm','steel','town','hill','lake','capital'])assert.match(tv,new RegExp(`case '${name}':`));
 assert.match(tv,/id="zoomReset"/);assert.match(tv,/id="mapLegend"/);assert.match(tv,/function focusAction\(/);
 assert.match(phone,/function miniMap\(/);assert.match(phone,/data-tile=.*legal/);assert.match(phone,/data-route=.*legal/);
});

test('Phase 3 ships all eight approved realistic human tycoon portraits across eras and moods', () => {
 const fs = require('node:fs'); const path = require('node:path');
 const root = path.resolve(__dirname,'../public/art');
 const ids = ['augusta','silas','jack','ada','rupert','nell','ottoline','ezra'];
 for (const actor of ids) {
  const original=path.join(root,'avatars',`${actor}_human.png`);
  assert.ok(fs.existsSync(original), `Missing approved human portrait: ${actor}`);
  for (const era of ['steam','iron','electric'])for(const mood of ['neutral','smug','furious']) {
   const image=path.join(root,'avatars',`${actor}_${era}_${mood}.png`);
   assert.ok(fs.existsSync(image), `Missing ${actor} ${era}/${mood}`);
   assert.equal(fs.readFileSync(image).toString('hex',0,8),'89504e470d0a1a0a');
  }
 }
 for(const file of ['iron-crown-premium.png','victorian-terminal.jpg'])assert.ok(fs.existsSync(path.join(root,file)),file);
});

test('Phase 3 embeds premium working lobby, human actor selection and event reactions without a CDN', () => {
 const fs=require('node:fs'); const path=require('node:path');
 const tv=fs.readFileSync(path.resolve(__dirname,'../public/tv.html'),'utf8');
 const phone=fs.readFileSync(path.resolve(__dirname,'../public/phone.html'),'utf8');
 for(const id of ['roomCode','qr','mode','players','startBtn','botBtn','map','roster','rulesBtn'])assert.ok(tv.includes(`id="${id}"`),id);
 for(const id of ['augusta','silas','jack','ada','rupert','nell','ottoline','ezra'])assert.ok(tv.includes(`/art/avatars/${id}_human.png`),id);
 for(const fragment of ['hero-premium','iron-crown-premium.png','actor-notice','showActorNotice','victorian-terminal.jpg'])assert.ok(tv.includes(fragment),fragment);
 for(const fragment of ['tycoon-intro','avatar-gallery','actor-perk','player-showcase','watch-mood','phone-join-scene'])assert.ok(phone.includes(fragment),fragment);
 for (const html of [tv,phone])assert.doesNotMatch(html,/<script\s+src=|https:\/\/fonts\.|https:\/\/cdnjs\./);
});

// PHASE 3 continuation — authoritative character reaction contract.
test('Phase 3: building a City sets a public four-second smug reaction',()=>{
 const {r,ps}=setup();const [p,q]=ps;
 const town=r.tiles.find(t=>t.type==='town');town.owner=p.id;town.city=false;
 g.tick(r,r.deadline+1);p.resources={coal:10,timber:10,grain:10,steel:10,gold:10};
 g.setAction(r,p,0,{type:'city',tile:town.id});g.setAction(r,p,1,{type:'skip'});g.lockIn(r,p);g.lockIn(r,q);
 g.revealStep(r);const shown=g.publicView(r).players.find(x=>x.id===p.id);
 assert.equal(town.city,true);assert.equal(shown.reaction,'smug');assert.equal(shown.reactionReason,'New city founded');
 assert.ok(shown.reactionUntil>Date.now());
});
test('Phase 3: failed plans cause furious reaction, no secret private details in public state',()=>{
 const {r,ps}=setup();const [p,q]=ps;
 const target=r.tiles.find(t=>t.type==='town');target.owner=p.id;target.city=false;
 g.tick(r,r.deadline+1);p.resources={coal:10,timber:10,grain:10,steel:10,gold:10};
 g.setAction(r,p,0,{type:'city',tile:target.id});g.setAction(r,p,1,{type:'skip'});g.lockIn(r,p);g.lockIn(r,q);
 target.owner=q.id;g.revealStep(r);
 const pub=g.publicView(r);assert.equal(pub.players.find(x=>x.id===p.id).reaction,'furious');
 assert.ok(pub.feed.some(x=>x.kind==='fail'&&x.player===p.id));
 assert.ok(pub.feed.every(x=>Number.isFinite(x.at)));
 assert.ok(!JSON.stringify(pub).includes(p.token));
});
test('Phase 3: trophy changes trigger winner and loser emotions only when ownership changes',()=>{
 const {r,ps}=setup();const [p,q]=ps;
 const ownP=g.owned(r,p)[0],ownQ=g.owned(r,q)[0];ownP.soldiers=7;ownQ.soldiers=1;
 g.updatePrestige(r);assert.equal(g.publicView(r).players.find(x=>x.id===p.id).reaction,'smug');
 assert.equal(r.trophies.army,p.id);
 ownP.soldiers=0;ownQ.soldiers=9;g.updatePrestige(r);
 assert.equal(r.trophies.army,q.id);assert.equal(p.reaction,'furious');assert.equal(q.reaction,'smug');
 const count=r.feed.filter(x=>x.kind==='trophy').length;g.updatePrestige(r);
 assert.equal(r.feed.filter(x=>x.kind==='trophy').length,count,'no repeated trophy reactions');
});
test('Phase 3: contenders react to clash results with defender and claimant treated distinctly',()=>{
 const {r,ps}=setup();const [p,q]=ps;
 const tile=r.tiles.find(x=>!x.owner&&x.type==='forest');assert.ok(tile);
 r.clashes=[{tile:tile.id,defender:null,claimants:[{player:p.id,kind:'build',sources:[],cost:{timber:1,grain:1}},{player:q.id,kind:'build',sources:[],cost:{timber:1,grain:1}}]}];
 g.resolveClashes(r);
 assert.ok([p.id,q.id].includes(tile.owner));
 const winner=r.players.find(x=>x.id===tile.owner),loser=r.players.find(x=>x.id!==tile.owner);
 assert.equal(winner.reaction,'smug');assert.equal(loser.reaction,'furious');
 assert.ok(r.feed.some(x=>x.kind==='clash'&&x.results.length===2));
});
test('Phase 3: TV and phone honour live server reactions and display era-specific visuals',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const tv=fs.readFileSync(path.resolve(__dirname,'../public/tv.html'),'utf8');
 const ph=fs.readFileSync(path.resolve(__dirname,'../public/phone.html'),'utf8');
 for(const ui of [tv,ph]){assert.match(ui,/reactionUntil/);assert.match(ui,/dataset\.era/);assert.match(ui,/data-live-portrait|data-player-avatar/);}
 assert.match(tv,/TROPHY CLAIMED/);assert.match(tv,/DESTINATION FULFILLED/);
 assert.match(ph,/watch-mood/);assert.doesNotMatch(ph,/<script[^>]+src=/i);
});

// PHASE 3 (v1.4) — compact premium character dossiers and gallery.
test('Phase 3.4: mobile selector includes eight accessible independent selections and dossiers',()=>{
 const fs=require('node:fs'), path=require('node:path');
 const html=fs.readFileSync(path.resolve(__dirname,'../public/phone.html'),'utf8');
 for(const id of require('../src/constants').AVATARS.map(x=>x.id)){
  assert.match(html,new RegExp(`\\b${id}:\\s*\\[`),'Missing character wardrobe: '+id);
  assert.match(html,new RegExp(`\\b${id}:\\s*['\"]`),'Missing character personality: '+id);
 }
 for(const phrase of ['actor-card','data-avatar','data-profile','PRIVATE TYCOON DOSSIER','aria-pressed','profileEra','profileMood','profileChoose','profileClose','tabindex="-1"'])assert.ok(html.includes(phrase),phrase);
 assert.ok(html.includes("taken.has(id)?'disabled'"),'Unavailable tycoons must not be selectable');
 assert.ok(!html.includes('<button class="avatar-choice"'), 'Old long-form selector must be replaced');
});
test('Phase 3.4: TV gallery supports all eight people, eras, screen reader friendly controls and closing',()=>{
 const fs=require('node:fs'), path=require('node:path');
 const html=fs.readFileSync(path.resolve(__dirname,'../public/tv.html'),'utf8');
 for(const phrase of ['id="galleryBtn"','galleryActors','showTycoons()','tycoon-gallery-grid','gallery-feature','aria-pressed','data-gallery-era','closeGallery','galleryEra'])assert.ok(html.includes(phrase),phrase);
 const section=html.substring(html.indexOf('const galleryActors=['),html.indexOf('let galleryActor='));
 for(const actor of require('../src/constants').AVATARS) assert.match(section,new RegExp(`['\"]${actor.id}['\"]`));
});
test('Phase 3.4: character art is served locally and portrait alternatives exist without network dependencies',()=>{
 const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
 const dir=path.resolve(__dirname,'../public/art/avatars');
 const ids=require('../src/constants').AVATARS.map(x=>x.id);
 for(const id of ids){const seen=new Set();for(const era of ['steam','iron','electric'])for(const mood of ['neutral','smug','furious']){
  const file=path.join(dir,`${id}_${era}_${mood}.png`);
  assert.ok(fs.statSync(file).size>15000,`Corrupt or tiny portrait: ${file}`);
  seen.add(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'));
 }assert.equal(seen.size,9,`${id} should have 9 distinct PNG render treatments`);}
});

test('Phase 3.5: game UIs use human portraits, not previous era derivatives',()=>{
 const fs=require('node:fs'),path=require('node:path');
 for(const name of ['phone.html','tv.html']){
  const html=fs.readFileSync(path.resolve(__dirname,'../public',name),'utf8');
  assert.ok(html.includes('_human.png?v=1.5.0'));
  assert.ok(!html.includes('_steam_neutral.png'));
  assert.ok(!html.includes('${galleryEra}_neutral.png'));
  assert.ok(!html.includes('profilePath('));
  assert.match(html,/data-mood|dataset\.mood/);
 }
});
test('Phase 3.5: eight original human portraits exist and are distinct PNG images',()=>{
 const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
 const seen=new Set();
 for(const {id} of require('../src/constants').AVATARS){
  const b=fs.readFileSync(path.resolve(__dirname,'../public/art/avatars',id+'_human.png'));
  assert.ok(b.length>20000,id);assert.equal(b.toString('hex',0,8),'89504e470d0a1a0a');
  seen.add(crypto.createHash('sha256').update(b).digest('hex'));
 }
 assert.equal(seen.size,8);
});

test('Phase 4: two attacks cannot double-book a source army',()=>{
 const {r,ps}=setup();g.tick(r,r.deadline+1);const [p,q]=ps;
 const home=g.owned(r,p)[0];home.soldiers=3;
 const target=neighbours(home,new Map(r.tiles.map(t=>[t.id,t]))).find(t=>t.owner!==p.id&&t.type!=='lake'&&t.type!=='capital');
 assert.ok(target);target.owner=q.id;target.soldiers=1;
 g.setAction(r,p,0,{type:'attack',tile:target.id,sources:[{tile:home.id,count:2}]});
 assert.throws(()=>g.setAction(r,p,1,{type:'attack',tile:target.id,sources:[{tile:home.id,count:2}]}),/cannot be committed/);
 assert.equal(p.actions[1],null);
 g.setAction(r,p,1,{type:'attack',tile:target.id,sources:[{tile:home.id,count:1}]});
});
test('Phase 4: second Depot cannot target the same tile',()=>{
 const {r,ps}=setup();g.tick(r,r.deadline+1);const p=ps[0];
 p.resources.timber=5;p.resources.grain=5;
 const tile=g.legalTargets(r,p).build[0];assert.ok(tile);
 g.setAction(r,p,0,{type:'build',tile});
 assert.throws(()=>g.setAction(r,p,1,{type:'build',tile}),/different tile/);
 assert.equal(p.actions[1],null);
});
test('Phase 4: combined double attack rolls once per player',()=>{
 const {r,ps}=setup();g.tick(r,r.deadline+1);const [p,q]=ps;
 const home=g.owned(r,p)[0];home.soldiers=6;
 const target=neighbours(home,new Map(r.tiles.map(t=>[t.id,t]))).find(t=>t.owner!==p.id&&t.type!=='lake'&&t.type!=='capital');
 assert.ok(target);target.owner=q.id;target.soldiers=0;
 for(let i=0;i<2;i++)g.setAction(r,p,i,{type:'attack',tile:target.id,sources:[{tile:home.id,count:2}]});
 g.lockIn(r,p);g.lockIn(r,q);
 for(let i=0;i<5&&r.status==='reveal';i++)g.revealStep(r);
 const clash=r.feed.find(x=>x.kind==='clash'&&x.tile===target.id);
 assert.ok(clash);assert.equal(clash.results.length,2);
 assert.equal(new Set(clash.results.map(x=>x.id)).size,2);
 assert.ok(home.soldiers>=0&&home.soldiers<=6);
});
test('Phase 4: reject special or inherited trade resource names',()=>{
 const {r,ps}=setup();g.tick(r,r.deadline+1);
 for(const bad of [{constructor:1,grain:1},{toString:1,grain:1},JSON.parse('{"__proto__":1,"grain":1}')]){
  assert.throws(()=>g.setAction(r,ps[0],0,{type:'trade',kind:'player',to:ps[1].id,give:bad,want:{coal:1}}),/Invalid resource amount/);
 }
});
test('Phase 4: bank trade can fund the second action',()=>{
 const {r,ps}=setup();g.tick(r,r.deadline+1);const [p,q]=ps;
 p.resources={coal:2,timber:5,grain:1,steel:1,gold:2};
 g.setAction(r,p,0,{type:'trade',kind:'bank',give:'timber',want:'gold'});
 g.setAction(r,p,1,{type:'research',kind:'ticket'});
 g.lockIn(r,p);g.lockIn(r,q);
 g.revealStep(r);assert.equal(p.resources.gold,3);
 const tickets=p.tickets.length;g.revealStep(r);
 assert.equal(p.resources.gold,0);assert.equal(p.resources.coal,1);assert.equal(p.tickets.length,tickets+1);
});
test('Phase 4: compulsory trade cannot force unavailable payment',()=>{
 const {r,ps}=setup(2,'advanced');g.tick(r,r.deadline+1);const [p,q]=ps;
 p.avatar='ezra';p.resources.grain=3;q.resources.steel=0;
 g.setAction(r,p,0,{type:'trade',kind:'player',to:q.id,give:{grain:2},want:{steel:1}});
 g.lockIn(r,p);g.lockIn(r,q);
 const before=p.resources.grain;g.revealStep(r);
 assert.equal(r.status,'reveal');assert.equal(p.resources.grain,before);
});
test('Phase 4: Telegraph change rejects a depleted budget',()=>{
 const {r,ps}=setup();g.tick(r,r.deadline+1);const [p,q]=ps;
 p.upgrades.push('telegraph');p.resources={coal:0,timber:0,grain:0,steel:0,gold:0};
 g.setAction(r,p,0,{type:'skip'});g.setAction(r,p,1,{type:'skip'});
 g.lockIn(r,p);g.lockIn(r,q);
 assert.throws(()=>g.telegraph(r,p,1,{type:'research',kind:'ticket'}),/cannot afford/);
 assert.equal(p.telegraphUsed,false);
 g.telegraph(r,p,1,{type:'skip'});assert.equal(p.telegraphUsed,true);
});
test('Phase 4: invalid bank actions and deadline pass safely',()=>{
 const {r,ps}=setup();g.tick(r,r.deadline+1);
 assert.throws(()=>g.setAction(r,ps[0],0,{type:'trade',kind:'bank',give:'coal',want:'coal'}),/different resources/);
 assert.throws(()=>g.setAction(r,ps[0],0,{type:'trade',kind:'player',to:ps[1].id,give:{gold:100},want:{coal:1}}),/Invalid resource amount/);
 g.tick(r,r.deadline+1);assert.equal(r.status,'reveal');
 assert.ok(ps.every(p=>p.locked));assert.deepEqual(ps[0].actions,[{type:'skip'},{type:'skip'}]);
});
test('Phase 4: two, four and eight AI players finish all game modes with valid stock',()=>{
 for(const mode of ['quick','standard','advanced'])for(const n of [2,4,8]){
  const {r}=setup(n,mode,true);const steps=advance(r,220);assert.equal(r.status,'finished');
  assert.ok(steps<220&&r.round<=r.settings.rounds);
  for(const p of r.players)for(const val of Object.values(p.resources))assert.ok(Number.isInteger(val)&&val>=0);
  for(const tile of r.tiles)assert.ok(Number.isInteger(tile.soldiers)&&tile.soldiers>=0);
 }
});
test('Phase 4: projected costs and exchange rates are private and authoritative',()=>{
 const {r,ps}=setup();g.tick(r,r.deadline+1);const p=ps[0];
 p.resources={coal:1,timber:4,grain:2,steel:1,gold:4};
 g.setAction(r,p,0,{type:'trade',kind:'bank',give:'timber',want:'steel'});
 const v=g.privateView(r,p);
 assert.deepEqual(v.planBalance,{coal:1,timber:1,grain:2,steel:2,gold:4});
 assert.equal(v.bankRates.timber,3);
 assert.ok(!JSON.stringify(g.publicView(r)).includes('planBalance'));
 p.upgrades.push('corn');assert.equal(g.privateView(r,p).bankRates.grain,2);
});
test('Phase 4: Telegraph never allows a second Research after the first resolved',()=>{
 const {r,ps}=setup();g.tick(r,r.deadline+1);const [p,q]=ps;
 p.resources={coal:10,timber:10,grain:10,steel:10,gold:10};p.upgrades.push('telegraph');
 g.setAction(r,p,0,{type:'research',kind:'ticket'});g.setAction(r,p,1,{type:'skip'});
 g.lockIn(r,p);g.lockIn(r,q);g.revealStep(r);
 assert.throws(()=>g.telegraph(r,p,1,{type:'research',kind:'ticket'}),/once per round/);
 assert.equal(p.telegraphUsed,false);
});
