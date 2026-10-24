'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const g=require('../src/game');
const {MODE,AVATARS}=require('../src/constants');
const {generateMap}=require('../src/map');
const fs=require('node:fs'),path=require('node:path');
function make(n=3){
 const r=g.createRoom('RAIL');
 const ps=Array.from({length:n},(_,i)=>g.addPlayer(r,`Trader ${i+1}`));
 for(let i=0;i<n;i++)g.chooseAvatar(r,ps[i],AVATARS[i].id);
 const m=generateMap();Object.assign(r,{tiles:m.tiles,routes:m.routes,ticketDeck:m.deck,status:'plan',round:MODE.standard.rounds,deadline:Date.now()+30_000});
 for(const p of ps)p.resources={coal:5,timber:5,grain:5,steel:5,gold:10};
 return {r,ps};
}
function skip(p,r){for(let i=0;i<3;i++)if(!p.actions[i])g.setAction(r,p,i,{type:'skip'});g.lockIn(r,p);}
function revealMarket(r){for(let step=0;step<64&&r.status==='reveal';step++)g.revealStep(r);assert.equal(r.status,'market');}
test('B1: all three slots validate and Research remains once per round',()=>{
 const {r,ps:[p]}=make();assert.equal(p.actions.length,3);
 assert.throws(()=>g.setAction(r,p,3,{type:'skip'}),/slot/);
 assert.throws(()=>g.setAction(r,p,-1,{type:'skip'}),/slot/);
 g.setAction(r,p,0,{type:'skip'});g.setAction(r,p,1,{type:'research',kind:'ticket'});
 assert.throws(()=>g.setAction(r,p,2,{type:'research',kind:'ticket'}),/once per round/);
 assert.equal(p.actions[2],null);
 g.setAction(r,p,2,{type:'skip'});g.lockIn(r,p);assert.equal(p.actions.length,3);
});
test('B1: shorter planning timers are in the authoritative mode table',()=>{
 assert.equal(MODE.quick.plan,40);assert.equal(MODE.standard.plan,45);assert.equal(MODE.advanced.plan,45);
});
test('A6: multiple offers escrow together, remain private and complete in original Reveal order',()=>{
 const {r,ps:[a,b,c]}=make();
 c.resources.steel=1;
 g.setAction(r,a,0,{type:'trade',kind:'player',to:c.id,give:{coal:1},want:{steel:1}});
 g.setAction(r,b,0,{type:'trade',kind:'player',to:c.id,give:{grain:2},want:{steel:1}});
 for(const p of [a,b,c])skip(p,r);
 revealMarket(r);
 assert.equal(a.resources.coal,4);assert.equal(b.resources.grain,3);
 assert.equal(r.marketOffers.length,2);
 const publicStr=JSON.stringify(g.publicView(r));
 assert.equal(g.publicView(r).market.offers.length,2);
 assert.ok(!publicStr.includes('"give"'));assert.ok(!publicStr.includes('"want"'));
 assert.equal(g.privateView(r,a).offers.length,0);
 assert.equal(g.privateView(r,b).offers.length,0);
 assert.equal(g.privateView(r,c).offers.length,2);
 const [first,second]=g.privateView(r,c).offers;
 g.replyOffer(r,c,true,second.id);
 assert.equal(r.status,'market','The Exchange must stay open for the other pending offer');
 g.replyOffer(r,c,true,first.id);
 assert.equal(r.status,'finished');
 assert.equal(a.resources.coal,4);assert.equal(a.resources.steel,6);
 assert.equal(b.resources.grain,5,'Later unaffordable offer must be refunded');
 assert.equal(c.resources.steel,0);
 assert.equal(r.marketOffers.length,0);
});
test('A6: all unanswered offers return escrow together at one shared deadline',()=>{
 const {r,ps:[a,b]}=make(2);
 g.setAction(r,a,0,{type:'trade',kind:'player',to:b.id,give:{coal:3},want:{grain:1}});
 for(const p of [a,b])skip(p,r);
 revealMarket(r);
 assert.equal(a.resources.coal,2);
 assert.ok(r.deadline>Date.now()+18_000);
 assert.equal(g.tick(r,r.deadline+1),true);
 assert.equal(r.status,'finished');assert.equal(a.resources.coal,5);
});
test('A6: neither double-reply nor fake offer ID can change another offer',()=>{
 const {r,ps:[a,b]}=make(2);
 g.setAction(r,a,0,{type:'trade',kind:'player',to:b.id,give:{coal:1},want:{steel:1}});
 for(const p of [a,b])skip(p,r);
 revealMarket(r);
 assert.throws(()=>g.replyOffer(r,a,true),/Choose a pending/);
 assert.throws(()=>g.replyOffer(r,b,true,'bogus'),/Choose a pending/);
 const id=r.marketOffers[0].id;
 g.replyOffer(r,b,false,id);
 assert.equal(r.status,'finished');
 assert.throws(()=>g.replyOffer(r,b,true,id),/Exchange is closed/);
 assert.equal(a.resources.coal,5);
});
test('C2: AI answers a fair offer but protects its final Steel and Timber',()=>{
 const {r,ps:[a,b]}=make(2);b.ai=true;b.connected=true;
 b.resources.steel=2;
 g.setAction(r,a,0,{type:'trade',kind:'player',to:b.id,give:{coal:2},want:{steel:1}});
 for(const p of [a,b])skip(p,r);while(r.status==='reveal')g.revealStep(r);
 assert.equal(r.status,'finished');assert.equal(a.resources.steel,6);
 // AI rejects deals that remove its last critical unit despite a fair raw count.
 const next=make(2),[sender,receiver]=next.ps;receiver.ai=true;receiver.connected=true;receiver.resources.steel=1;
 g.setAction(next.r,sender,0,{type:'trade',kind:'player',to:receiver.id,give:{grain:3},want:{steel:1}});
 for(const p of [sender,receiver])skip(p,next.r);
 while(next.r.status==='reveal')g.revealStep(next.r);
 assert.equal(sender.resources.grain,5);assert.equal(receiver.resources.steel,1);
});
test('C2: production AI plans three orders through authoritative validators, not random actions',()=>{
 const {r,ps:[p,q]}=make(2);p.ai=true;p.resources={coal:12,timber:12,grain:12,steel:12,gold:24};
 // An owned town must be upgraded before a speculative recruit or bank trade.
 const town=r.tiles.find(t=>t.type==='town');town.owner=p.id;
 g.autopilot(r);
 assert.equal(p.locked,true);
 assert.equal(p.actions.length,3);
 assert.equal(p.actions[0].type,'city');
 assert.ok(p.actions.filter(x=>x.type==='city'&&x.tile===town.id).length===1);
 assert.equal(q.locked,false);
});
test('TV and phone scripts support three private orders and simultaneous market controls',()=>{
 const tv=fs.readFileSync(path.join(__dirname,'../public/tv.html'),'utf8');
 const ph=fs.readFileSync(path.join(__dirname,'../public/phone.html'),'utf8');
 assert.match(tv,/THE EXCHANGE IS OPEN/);assert.match(tv,/three actions/);
 assert.match(ph,/Three orders per round/);assert.match(ph,/Lock In Three Orders/);
 assert.match(ph,/function renderMarket\(\)/);
 assert.match(ph,/data-accept/);assert.match(ph,/data-decline/);
 assert.match(ph,/offerId:el\.dataset\.accept/);
 assert.match(ph,/offerId:el\.dataset\.decline/);
 for(const source of [tv,ph])new Function(source.split('<script>')[1].split('</script>')[0]);
});
