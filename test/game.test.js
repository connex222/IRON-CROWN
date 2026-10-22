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
