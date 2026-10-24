'use strict';
const fs=require('node:fs'),path=require('node:path');
const game=require('../src/game');
const ids=require('../src/constants').AVATARS.map(x=>x.id);
const room=game.createRoom('RAIL');
for(let i=0;i<4;i++){const p=game.addPlayer(room,'Player '+(i+1));game.chooseAvatar(room,p,ids[i]);p.connected=true;}
game.startGame(room,'standard');
room.players.forEach((p,i)=>{p.ticketChoices=[];p.resources={coal:8+i,timber:6,grain:6,steel:6,gold:14+i*3};p.locked=false;});
room.tiles.filter(t=>['coal','forest','farm','steel','town'].includes(t.type)).slice(0,8).forEach((t,i)=>{t.owner=room.players[i%4].id;t.soldiers=1;t.city=t.type==='town';});
for(let i=0;i<room.routes.length;i++)if(i<4)room.routes[i].owner=room.players[i%4].id;
room.round=10;room.era='electric';room.status='plan';room.deadline=Date.now()+45_000;
game.updatePrestige(room);
const snapshots={};
for(const status of ['plan','market','finished']){
 room.status=status;
 if(status==='market'){
  room.deadline=Date.now()+20_000;
  room.marketOffers=[{id:'M10-1',from:room.players[1].id,to:room.players[0].id,give:{coal:1,timber:1,grain:0,steel:0,gold:0},want:{coal:0,timber:0,grain:0,steel:1,gold:0},compelled:false,answer:null},{id:'M10-2',from:room.players[2].id,to:room.players[0].id,give:{coal:0,timber:0,grain:2,steel:0,gold:0},want:{coal:0,timber:0,grain:0,steel:0,gold:3},compelled:false,answer:null}];
 }
 if(status==='finished'){
  room.round=12;room.deadline=0;room.marketOffers=[];
  for(const p of room.players)p.endgameDividend=game.royalDividend(p.resources);
  game.updatePrestige(room);room.sharedWinners=[room.players[0].id];room.lastWinner=room.players[0].id;
 }
 snapshots[status]={public:game.publicView(room),private:game.privateView(room,room.players[0]),playerId:room.players[0].id};
}
const shared=structuredClone(snapshots.finished);
shared.public.winners=[room.players[0].id,room.players[1].id];shared.public.winner=null;
shared.public.players[1].prestige=shared.public.players[0].prestige;
shared.playerId=room.players[1].id;
snapshots.shared=shared;
fs.writeFileSync(path.join(__dirname,'stage5-fixtures.json'),JSON.stringify(snapshots));
console.log('Fixtures',Object.fromEntries(Object.entries(snapshots).map(([k,v])=>[k,{phase:v.public.status,tiles:v.public.tiles.length,routes:v.public.routes.length,players:v.public.players.length}])));
