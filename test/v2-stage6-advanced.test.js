'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const game=require('../src/game'),{MODE}=require('../src/constants');
test('Stage 6 advanced target is 24 with the same 45-second plan',()=>{
 assert.equal(MODE.advanced.target,24);assert.equal(MODE.advanced.plan,45);
 assert.equal(MODE.standard.target,22);assert.equal(MODE.quick.target,12);
});
test('Stage 7 Advanced: capped at five Gold Prestige, with Standard unchanged',()=>{
 const stock={coal:8,timber:8,grain:8,steel:8,gold:100};
 assert.equal(game.royalDividend(stock,'standard'),6);
 assert.equal(game.royalDividend(stock,'advanced'),8);
 assert.equal(game.royalDividend({coal:0,timber:0,grain:0,steel:0,gold:16},'advanced'),4);
 assert.equal(game.royalDividend({coal:0,timber:0,grain:0,steel:0,gold:16},'standard'),3);
 assert.equal(game.royalDividend({coal:0,timber:0,grain:0,steel:0,gold:20},'advanced'),5);
});
