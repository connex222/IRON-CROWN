'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const game=require('../src/game');
const tile=(q,r,type='forest',owner=null,soldiers=0)=>({id:`${q},${r}`,q,r,type,owner,soldiers,city:false,grand:false});
function fixture(){
 const r=game.createRoom('TEST'),p=game.addPlayer(r,'Augusta'),q=game.addPlayer(r,'Silas');
 p.avatar='augusta';q.avatar='silas';
 p.resources={coal:10,timber:10,grain:10,steel:10,gold:10};
 q.resources={coal:10,timber:10,grain:10,steel:10,gold:10};
 r.tiles=[tile(0,0,'capital'),tile(1,0,'forest'),tile(1,1,'hill',p.id,3),tile(2,0,'forest'),tile(3,0,'town'),tile(2,-1,'farm'),tile(0,1,'forest')];
 r.routes=[{id:'R1',a:'0,0',b:'3,0',path:['0,0','1,0','2,0','3,0'],segments:3,owner:null,blocked:false},
 {id:'R2',a:'0,0',b:'2,0',path:['0,0','1,0','2,0'],segments:2,owner:null,blocked:false},
 {id:'R3',a:'1,0',b:'3,0',path:['1,0','2,0','3,0'],segments:2,owner:null,blocked:false}];
 r.status='plan';r.round=1;r.deadline=Date.now()+100_000;
 return {r,p,q};
}
test('V2: no town ownership needed — any owned or adjacent route-path tile unlocks rail laying',()=>{
 const {r,p}=fixture();assert.equal(r.tiles.filter(t=>t.owner===p.id&&t.type==='town').length,0);
 assert.ok(game.legalTargets(r,p).track.includes('R1'));
 game.setAction(r,p,0,{type:'track',route:'R1'});
 assert.equal(p.actions[0].route,'R1');
});
test('V2: extending from your existing railway unlocks track, even without owned land',()=>{
 const {r,p}=fixture();r.tiles.find(t=>t.owner===p.id).owner=null;
 r.routes[0].owner=p.id;
 assert.ok(game.legalTargets(r,p).track.includes('R3'));
});
test('V2: opponents cannot claim another player’s physical track section',()=>{
 const {r,p,q}=fixture();r.routes[0].owner=q.id;
 assert.ok(!game.legalTargets(r,p).track.includes('R2'));
 assert.throws(()=>game.setAction(r,p,0,{type:'track',route:'R2'}),/connected depot|rival-owned/);
});
test('V2: own track segments cost nothing when reused',()=>{
 const {r,p}=fixture();r.routes[0].owner=p.id;
 const cost=game.costOf(r,p,{type:'track',route:'R3'});
 assert.equal(cost.timber,0);assert.equal(cost.steel,0);
});
test('V2: rival claims made after planning invalidate route at reveal without charging materials',()=>{
 const {r,p,q}=fixture();r.turnOffset=0;
 game.setAction(r,p,0,{type:'track',route:'R2'});game.setAction(r,p,1,{type:'skip'});
 game.lockIn(r,p);game.lockIn(r,q);
 r.routes[0].owner=q.id;
 const timber=p.resources.timber,steel=p.resources.steel,gold=p.resources.gold;
 while(r.status==='reveal'&&r.revealCursor<r.pending.length)game.revealStep(r);
 assert.equal(r.routes[1].owner,null);
 assert.equal(p.resources.timber,timber);assert.equal(p.resources.steel,steel);assert.equal(p.resources.gold,gold+1);
});
test('V2: Soldiers next to contested free tile provide strength; losers reclaim cost and gain Gold',()=>{
 const {r,p,q}=fixture(),site=r.tiles.find(t=>t.id==='1,0');
 const beginning=r.tiles.find(t=>t.id==='1,1').soldiers;
 q.resources.timber=3;q.resources.grain=4;q.resources.gold=5;
 r.clashes=[{tile:site.id,defender:null,claimants:[
 {player:p.id,kind:'build',sources:[],cost:{timber:1,grain:1}},
 {player:q.id,kind:'build',sources:[],cost:{timber:1,grain:1}}]}];
 const original=Math.random;Math.random=()=>0;
 try{game.resolveClashes(r);}finally{Math.random=original;}
 assert.equal(site.owner,p.id);assert.equal(site.soldiers,1);
 assert.equal(r.tiles.find(t=>t.id==='1,1').soldiers,beginning,'support Soldiers stay home');
 assert.equal(q.resources.timber,4);assert.equal(q.resources.grain,5);assert.equal(q.resources.gold,6);
 const feed=r.feed.find(x=>x.kind==='clash');assert.equal(feed.results.find(x=>x.id===p.id).support,3);
});
test('V2: persistent tie without defender yields Stalemate, no capture and full build refunds',()=>{
 const {r,p,q}=fixture(),site=r.tiles.find(t=>t.id==='1,0');
 r.tiles.find(t=>t.id==='1,1').soldiers=0;
 r.clashes=[{tile:site.id,defender:null,claimants:[{player:p.id,kind:'build',sources:[],cost:{timber:1,grain:1}},{player:q.id,kind:'build',sources:[],cost:{timber:1,grain:1}}]}];
 const golds=[p.resources.gold,q.resources.gold],original=Math.random;Math.random=()=>0;
 try{game.resolveClashes(r);}finally{Math.random=original;}
 assert.equal(site.owner,null);assert.equal(p.resources.gold,golds[0]+1);assert.equal(q.resources.gold,golds[1]+1);
 const notice=r.feed.find(x=>x.stalemate);assert.equal(notice.rerolls,3);
});
test('V2: completely identical final ranking crowns all tied players without seat priority',()=>{
 const {r,p,q}=fixture();r.routes=[];r.tiles.forEach(t=>{t.owner=null;t.soldiers=0;});
 r.status='reveal';r.round=r.settings.rounds;r.pending=[];r.revealCursor=0;
 game.revealStep(r);
 assert.equal(r.status,'finished');assert.equal(r.lastWinner,null);
 assert.deepEqual(new Set(game.publicView(r).winners),new Set([p.id,q.id]));
 assert.ok(r.feed.some(x=>x.shared&&x.kind==='win'));
});
test('V2: placement picks a random first round order and reverses it',()=>{
 const {r,p,q}=fixture();
 const fresh=game.createRoom('DRAW');const a=game.addPlayer(fresh,'A'),b=game.addPlayer(fresh,'B'),c=game.addPlayer(fresh,'C');
 for(const [player,avatar] of [[a,'augusta'],[b,'silas'],[c,'jack']])game.chooseAvatar(fresh,player,avatar);
 const map=()=>({tiles:r.tiles.map(t=>({...t,owner:null})),routes:r.routes.map(t=>({...t,owner:null})),deck:Array.from({length:9},(_,i)=>({id:'T'+i,a:'0,0',b:'3,0',value:2}))});
 game.startGame(fresh,'standard',map);
 const first=fresh.players.map(x=>x.id);
 for(const player of fresh.players)game.chooseTickets(fresh,player,player.ticketChoices.slice(0,2).map(t=>t.id));
 const front=fresh.placement.slice(0,3),back=fresh.placement.slice(3);
 assert.deepEqual(new Set(front),new Set(first));assert.deepEqual(back,front.slice().reverse());
 assert.ok(Number.isInteger(fresh.revealStart));assert.ok(fresh.revealStart>=0&&fresh.revealStart<3);
});
