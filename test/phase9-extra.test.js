'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const game=require('../src/game'),{seal,unseal}=require('../src/recovery');
test('Encrypted recovery explicitly includes the trade-offer phase',()=>{
 const r=game.createRoom('RAIL');
 game.addPlayer(r,'Ada');game.addPlayer(r,'Silas');
 r.status='offer';r.round=5;r.deadline=Date.now()+500;
 r.offer={to:r.players[1].id,from:r.players[0].id,deadline:Date.now()+500,expires:Date.now()+500};
 const restored=unseal(seal(r),r.code,r.hostToken);
 assert.equal(restored.room.status,'offer');
 assert.equal(restored.room.offer.to,r.players[1].id);
 assert.ok(restored.room.offer.deadline>Date.now()+100_000);
});
test('A normal host rejoin is not incorrectly called a browser restore',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const server=fs.readFileSync(path.resolve(__dirname,'../src/server.js'),'utf8');
 assert.match(server,/let room=null,restoredFromBrowser=false/);
 assert.match(server,/room=recovered\.room;markActivity\(room\);rooms\.set\(room\.code,room\);restoredFromBrowser=true/);
 assert.match(server,/recovered:restoredFromBrowser/);
});
