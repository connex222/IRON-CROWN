'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const game=require('../src/game');
const {earlyCrownEligible,QUICK_MULTI_EARLY_LEAD}=game;
function room(mode,players,target){return {mode,players:Array.from({length:players},()=>({})),settings:{target,rounds:mode==='quick'?8:12}};}
function ranking(...scores){return scores.map(prestige=>({prestige}));}
test('Quick retains 12 target and normal early Crown for two or three players',()=>{
 assert.equal(QUICK_MULTI_EARLY_LEAD,9);
 for(const n of [2,3]){assert.equal(earlyCrownEligible(room('quick',n,12),ranking(12,11,10)),true);assert.equal(earlyCrownEligible(room('quick',n,12),ranking(11,1,0)),false);}
});
test('Quick four- and eight-player early wins require a nine-Prestige margin',()=>{
 for(const n of [4,8]){const r=room('quick',n,12);assert.equal(earlyCrownEligible(r,ranking(12,4,3,2)),false);assert.equal(earlyCrownEligible(r,ranking(12,3,3,2)),true);assert.equal(earlyCrownEligible(r,ranking(11,0,0,0)),false);assert.equal(earlyCrownEligible(r,ranking(17,9,7,6)),false);assert.equal(earlyCrownEligible(r,ranking(18,9,8,7)),true);}
});
test('Standard and Advanced victory checks are unchanged',()=>{
 for(const [mode,target] of [['standard',22],['advanced',24]]){assert.equal(earlyCrownEligible(room(mode,4,target),ranking(target,target-1,target-2)),true);assert.equal(earlyCrownEligible(room(mode,4,target),ranking(target-1,0,0)),false);}
});
test('Public state describes early Crown while never exposing host credentials',()=>{
 for(const [n,required] of [[2,0],[3,0],[4,9],[8,9]]){const r=game.createRoom('TEST');for(let i=0;i<n;i++)game.addPlayer(r,'Guest '+i);r.mode='quick';r.settings=require('../src/constants').MODE.quick;const pub=game.publicView(r);assert.equal(pub.earlyCrownLeadRequired,required);assert.equal(pub.winTarget,12);assert.equal(JSON.stringify(pub).includes(r.hostToken),false);}
});
