'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const g=require('../src/game');
const {longestRail,ownsConnection}=require('../src/map');
const {AVATARS,UPGRADES,MODE,EVENTS}=require('../src/constants');
function room(mode='standard',players=2){
 const r=g.createRoom('CROW'),ps=[];
 for(let i=0;i<players;i++){
  const p=g.addPlayer(r,'Rival '+(i+1));g.chooseAvatar(r,p,AVATARS[i].id);ps.push(p);
 }
 g.startGame(r,mode);
 for(const p of ps)g.chooseTickets(r,p,p.ticketChoices.slice(0,2).map(t=>t.id));
 while(r.status==='placement'){
  const p=ps.find(p=>p.id===r.placement[r.placementIndex]);
  g.placeDepot(r,p,r.tiles.find(t=>!t.owner&&['coal','forest','farm','steel'].includes(t.type)).id);
 }
 for(const p of ps)g.chooseUpgrade(r,p,'navvies');
 return {r,ps};
}
function throughReveal(r){while(r.status==='reveal')g.revealStep(r);}
test('Phase 5: completed destination contracts pay printed Prestige and remain secret on the TV',()=>{
 const {r,ps:[p,q]}=room();const route=r.routes[0];
 p.tickets=[{id:'CLASSIFIED-IRON',a:route.a,b:route.b,value:4}];
 assert.equal(g.score(r,p).tickets,0);
 route.owner=p.id;
 assert.equal(ownsConnection(r.tiles,r.routes,p.id,route.a,route.b),true);
 assert.equal(g.score(r,p).tickets,4);
 g.updatePrestige(r);
 const publicState=JSON.stringify(g.publicView(r));
 assert.ok(!publicState.includes('CLASSIFIED-IRON'));
 assert.ok(!publicState.includes('"completed":'));
 assert.equal(g.privateView(r,p).ticketProgress[0].complete,true);
 assert.equal(g.privateView(r,p).ticketProgress[0].prestige,4);
 assert.ok(!JSON.stringify(g.privateView(r,q)).includes('CLASSIFIED-IRON'));
 route.owner=null;
 assert.equal(g.score(r,p).tickets,0,'lost connection removes previously earned ticket score');
 assert.equal(g.privateView(r,p).ticketProgress[0].complete,false);
});
test('Phase 5: overlapping rail tracks contribute physical segments only once',()=>{
 const rail=[{id:'a',path:['A','B','C'],segments:2},{id:'b',path:['B','C','D'],segments:2}];
 assert.equal(longestRail(rail),3);
 rail.push({id:'c',path:['X','Y','Z','W'],segments:3});
 assert.equal(longestRail(rail),3);
 rail.push({id:'d',path:['D','E'],segments:1});
 assert.equal(longestRail(rail),4);
});
test('Phase 5: Longest Railway trophy is taken away on a tie, and unique links decide lengths',()=>{
 const {r,ps:[p,q]}=room();
 const r0=r.routes[0];r0.owner=p.id;
 g.updatePrestige(r);assert.equal(r.trophies.rail,p.id);
 const r1=r.routes.find(x=>x.segments===r0.segments && x.id!==r0.id);
 if(r1){r1.owner=q.id;g.updatePrestige(r);assert.equal(r.trophies.rail,null);}
 r0.owner=null;g.updatePrestige(r);assert.notEqual(r.trophies.rail,p.id);
});
test('Phase 5: Board of Directors adds one Prestige per completed ticket, not per uncompleted ticket',()=>{
 const {r,ps:[p]}=room();const path=r.routes[0];
 p.tickets=[{id:'P',a:path.a,b:path.b,value:3},{id:'Q',a:'unreachable',b:'capital',value:2}];
 path.owner=p.id;
 assert.equal(g.score(r,p).tickets,3);
 p.upgrades.push('directors');
 assert.equal(g.score(r,p).tickets,4);
 assert.equal(g.privateView(r,p).ticketProgress[0].prestige,4);
 assert.equal(g.privateView(r,p).ticketProgress[1].prestige,3);
});
test('Phase 5: Advanced unfinished-ticket penalties, but no penalty in Quick or Standard',()=>{
 const {r,ps:[p]}=room('advanced');
 p.tickets=[{id:'INCOMPLETE',a:'no',b:'yes',value:4}];
 assert.equal(g.score(r,p).unfinished,1);
 assert.equal(g.score(r,p).total,-1);
 r.mode='standard';assert.equal(g.score(r,p).unfinished,0);
 r.mode='quick';assert.equal(g.score(r,p).unfinished,0);
});
test('Phase 5: Largest Army trophy requires five soldiers and has no holder on ties',()=>{
 const {r,ps:[p,q]}=room();
 for(const t of r.tiles)t.soldiers=0;
 g.owned(r,p)[0].soldiers=4;
 g.updatePrestige(r);assert.equal(r.trophies.army,null);
 g.owned(r,p)[0].soldiers=5;
 g.updatePrestige(r);assert.equal(r.trophies.army,p.id);assert.equal(p.breakdown.army,2);
 g.owned(r,q)[0].soldiers=5;
 g.updatePrestige(r);assert.equal(r.trophies.army,null);assert.equal(p.breakdown.army,0);
 g.owned(r,q)[0].soldiers=6;
 g.updatePrestige(r);assert.equal(r.trophies.army,q.id);
});
test('Phase 5: Market Crash overrides 2:1 bank trading discounts for this round',()=>{
 const {r,ps:[p]}=room('advanced');
 r.event=null; // Isolate the bank-rate baseline from random Advanced starting events.
 p.avatar='ada';p.bankResource='grain';p.upgrades.push('corn');
 assert.equal(g.tradeRate(r,p,'grain'),2);
 r.event={id:'crash'};
 assert.equal(g.tradeRate(r,p,'grain'),4);
 assert.equal(g.tradeRate(r,p,'steel'),4);
 r.mode='standard';assert.equal(g.tradeRate(r,p,'grain'),2);
});
test('Phase 5: era changes happen at documented rounds in Quick and Standard',()=>{
 for(const mode of ['quick','standard']){
  const {r,ps}=room(mode);const boundary=MODE[mode].eras[0];
  r.round=boundary;r.status='reveal';r.pending=[];r.revealCursor=0;
  throughReveal(r);
  assert.equal(r.status,'draft');assert.equal(r.era,'iron');
  for(const p of ps){assert.ok(p.draftChoices.some(x=>x.id==='bessemer'));g.chooseUpgrade(r,p,'bessemer');}
  const ironBoundary=boundary+MODE[mode].eras[1];
  r.round=ironBoundary;r.status='reveal';r.pending=[];r.revealCursor=0;
  throughReveal(r);
  assert.equal(r.status,'draft');assert.equal(r.era,'electric');
  for(const p of ps)assert.ok(p.draftChoices.some(x=>x.id==='station'));
 }
});
test('Phase 5: Grand Station upgrades the earliest City and awards exactly two points',()=>{
 const {r,ps:[p,q]}=room();
 const a=r.tiles.find(t=>t.type==='town');a.owner=p.id;a.city=true;a.cityOn=100;
 const b=r.tiles.find(t=>t.type==='town'&&t.id!==a.id);b.owner=p.id;b.city=true;b.cityOn=200;
 r.era='electric';r.status='draft';p.draftDone=false;q.draftDone=false;
 g.chooseUpgrade(r,p,'station');
 assert.equal(a.grand,true);assert.notEqual(b.grand,true);
 assert.equal(g.score(r,p).grand,2);
 g.chooseUpgrade(r,q,'directors');
 assert.equal(g.score(r,p).grand,2);
});
test('Phase 5: researched leftover upgrade spends the stated resources exactly once',()=>{
 const {r,ps:[p,q]}=room();
 g.tick(r,r.deadline+1);
 p.resources={coal:3,timber:5,grain:5,steel:5,gold:9};
 g.setAction(r,p,0,{type:'research',kind:'upgrade',upgrade:'corn'});
 g.setAction(r,p,1,{type:'skip'});
 r.turnOffset=0;g.lockIn(r,p);g.lockIn(r,q);
 g.revealStep(r);
 assert.ok(p.upgrades.includes('corn'));
 assert.equal(p.resources.gold,6);assert.equal(p.resources.coal,2);
 assert.equal(g.tradeRate(r,p,'grain'),2);
 assert.throws(()=>g.setAction(r,p,0,{type:'research',kind:'upgrade',upgrade:'corn'}),/Planning is closed/);
});
test('Phase 5: Destination Ticket research is refunded when the deck is empty',()=>{
 const {r,ps:[p,q]}=room();g.tick(r,r.deadline+1);
 p.resources={coal:3,timber:5,grain:5,steel:5,gold:9};r.ticketDeck=[];
 const tickets=p.tickets.length;
 g.setAction(r,p,0,{type:'research',kind:'ticket'});g.setAction(r,p,1,{type:'skip'});
 g.lockIn(r,p);g.lockIn(r,q);g.revealStep(r);
 assert.equal(p.tickets.length,tickets);assert.equal(p.resources.gold,9);assert.equal(p.resources.coal,3);
});
test('Phase 5: final round tie-break is Prestige, then Gold, then claimed routes',()=>{
 const {r,ps:[p,q]}=room();
 r.round=r.settings.rounds;r.status='reveal';r.pending=[];r.revealCursor=0;
 p.resources.gold=10;q.resources.gold=9;
 throughReveal(r);assert.equal(r.status,'finished');assert.equal(r.lastWinner,p.id);
 const {r:b,ps:[x,y]}=room();b.round=b.settings.rounds;b.status='reveal';b.pending=[];b.revealCursor=0;
 x.resources.gold=10;y.resources.gold=10;b.routes[0].owner=y.id;
 x.bonusPrestige=2;
 throughReveal(b);assert.equal(b.lastWinner,y.id,'railway holdings break an otherwise equal scoreboard when Prestige and Gold tie');
});
test('Phase 5: Royal Visit event awards Prestige to one leading City owner only',()=>{
 const {r,ps:[p,q]}=room('advanced');
 const town=r.tiles.find(t=>t.type==='town');town.owner=p.id;town.city=true;
 r.event={id:'royal'};r.round=12;r.status='reveal';r.pending=[];r.revealCursor=0;
 throughReveal(r);assert.equal(p.bonusPrestige,1);
 const {r:r2,ps:[x,y]}=room('advanced');const towns=r2.tiles.filter(t=>t.type==='town');
 towns[0].owner=x.id;towns[0].city=true;towns[1].owner=y.id;towns[1].city=true;
 r2.event={id:'royal'};r2.round=12;r2.status='reveal';r2.pending=[];r2.revealCursor=0;
 throughReveal(r2);assert.equal(x.bonusPrestige,0);assert.equal(y.bonusPrestige,0);
});
test('Phase 5: twelve Advanced events are distinct; Quick and Standard draw none',()=>{
 assert.equal(EVENTS.length,12);assert.equal(new Set(EVENTS.map(e=>e.id)).size,12);
 for(const mode of ['quick','standard']){
  const {r}=room(mode);assert.equal(r.event,null);
 }
 const {r}=room('advanced');assert.ok(r.event);assert.equal(r.events.length,12);
});
