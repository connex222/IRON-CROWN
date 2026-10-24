'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const game=require('../src/game'),{generateMap,distance}=require('../src/map'),{MODE}=require('../src/constants');
const edge=(a,b)=>[a,b].sort().join('|');
test('B3: maps retain eighteen original routes and add three bridges plus three Capital express lines, with unique termini',()=>{
 for(let n=0;n<75;n++){
  const map=generateMap();assert.equal(map.tiles.length,37);assert.equal(map.routes.length,24);
  assert.equal(map.routes.filter(r=>r.era==='steam').length,18);
  assert.equal(map.routes.filter(r=>r.era==='iron').length,3);
  assert.equal(map.routes.filter(r=>r.era==='electric').length,3);
  const pairs=new Set(),tiles=new Map(map.tiles.map(t=>[t.id,t]));
  for(const route of map.routes){
   const pair=edge(route.a,route.b);assert.ok(!pairs.has(pair),'duplicate endpoints '+pair);pairs.add(pair);
   assert.equal(route.path[0],route.a);assert.equal(route.path.at(-1),route.b);
   assert.ok(route.segments>=2&&route.segments<=5);
   for(let k=1;k<route.path.length;k++)assert.equal(distance(tiles.get(route.path[k-1]),tiles.get(route.path[k])),1);
   if(route.era==='iron')assert.equal(route.path.filter(id=>tiles.get(id)?.type==='lake').length,1);
   if(route.era==='electric'){assert.equal(route.a,'0,0');assert.ok(!route.path.some(id=>tiles.get(id)?.type==='lake'));}
   if(route.era==='steam')assert.ok(!route.path.some(id=>tiles.get(id)?.type==='lake'));
  }
  assert.equal(map.deck.length,24);
 }
});
test('B3: Steam conceals six new charters and Iron reveals only bridges',()=>{
 const r=game.createRoom('RAIL');
 // Reuse a single internally-consistent generated map, unlike stub maps.
 const m=generateMap();r.tiles=m.tiles;r.routes=m.routes;
 const a=game.addPlayer(r,'Bridge builder');game.chooseAvatar(r,a,'augusta');
 r.status='plan';r.era='steam';r.round=2;
 assert.equal(game.publicView(r).routes.length,18);
 assert.ok(!game.privateView(r,a).legal.track.some(id=>id.startsWith('B')||id.startsWith('E')));
 const ownedTile=r.tiles.find(t=>t.id===r.routes.find(x=>x.era==='iron').a);
 ownedTile.owner=a.id;r.routes.find(x=>x.era==='iron').owner=null;
 const firstBridge=r.routes.find(x=>x.era==='iron');
 assert.throws(()=>game.setAction(r,a,0,{type:'track',route:firstBridge.id}),/connected depot|rival-owned/);
 r.era='iron';
 assert.equal(game.publicView(r).routes.length,21);
 assert.ok(game.legalTargets(r,a).track.includes(firstBridge.id));
 assert.ok(!game.legalTargets(r,a).track.some(id=>id.startsWith('E')));
 r.era='electric';
 assert.equal(game.publicView(r).routes.length,24);
});
test('B3: an era-locked planned charter fails safely at Reveal without charging goods',()=>{
 const r=game.createRoom('RAIL');const p=game.addPlayer(r,'Builder');game.chooseAvatar(r,p,'silas');
 const m=generateMap();r.tiles=m.tiles;r.routes=m.routes;
 const bridge=r.routes.find(x=>x.era==='iron');r.tiles.find(t=>t.id===bridge.a).owner=p.id;
 r.status='plan';r.era='iron';r.round=5;r.deadline=Date.now()+10000;
 p.resources={timber:20,steel:20,coal:5,grain:5,gold:5};
 game.setAction(r,p,0,{type:'track',route:bridge.id});game.setAction(r,p,1,{type:'skip'});game.setAction(r,p,2,{type:'skip'});
 game.lockIn(r,p);
 r.era='steam';const before={...p.resources};
 game.revealStep(r);
 assert.equal(bridge.owner,null);assert.equal(p.resources.timber,before.timber);assert.equal(p.resources.steel,before.steel);
 assert.equal(p.resources.gold,before.gold+1);
});
test('B3: Electric Capital Express earns two Gold before Express Lines and a Capital bonus',()=>{
 const r=game.createRoom('RAIL'),a=game.addPlayer(r,'Electric operator'),b=game.addPlayer(r,'Other');
 r.status='income';r.mode='standard';r.settings=MODE.standard;r.era='electric';r.round=11;
 const m=generateMap();r.tiles=m.tiles;r.routes=m.routes;r.routes.find(x=>x.era==='electric').owner=a.id;
 a.resources.gold=0;b.resources.gold=0;
 game.beginIncome(r);
 assert.equal(a.resources.gold-b.resources.gold,3,'electric base 2 Gold plus 1 Capital bonus');
 a.upgrades.push('express');a.resources.gold=0;b.resources.gold=0;
 game.beginIncome(r);
 assert.equal(a.resources.gold,4,'Express Lines adds one more Gold to an Electric Capital Express');
});
test('B3: the new bridge and electric rules are shown only after unlock in self-contained client scripts',()=>{
 const tv=fs.readFileSync(path.resolve(__dirname,'../public/tv.html'),'utf8');
 const phone=fs.readFileSync(path.resolve(__dirname,'../public/phone.html'),'utf8');
 for(const html of [tv,phone])for(const [,script] of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(script);
 assert.match(tv,/Three new Lake Viaduct routes unlock/);
 assert.match(tv,/Three Capital Express routes unlock/);
 assert.match(tv,/viaduct-reveal/);
 assert.match(tv,/track-rival-blocked/);
 assert.match(phone,/Lake Viaduct ·/);
 assert.match(phone,/Capital Express ·/);
});

test('B3: the actual end-of-round transition announces each new era and reveals its new charters',()=>{
 for(const [round,era,count,headline] of [[4,'iron',21,'Lake Viaduct'],[8,'electric',24,'Capital Express']]){
  const r=game.createRoom('RAIL'),p=game.addPlayer(r,'Her Majesty');
  game.chooseAvatar(r,p,'augusta');const m=generateMap();r.tiles=m.tiles;r.routes=m.routes;
  r.settings=MODE.standard;r.mode='standard';r.round=round;r.era=round===4?'steam':'iron';
  r.status='reveal';r.pending=[];r.revealCursor=0;r.turnOffset=0;
  game.revealStep(r);
  assert.equal(r.round,round+1);assert.equal(r.era,era);assert.equal(r.status,'draft');
  assert.equal(game.publicView(r).routes.length,count);
  assert.ok(r.feed.some(item=>item.newRoutes&&item.message.includes(headline)));
 }
});
