'use strict';
const crypto=require('node:crypto');
const {AVATARS,UPGRADES,EVENTS,MODE,NAMES}=require('./constants');
const {generateMap,neighbours,shuffle,ownsConnection,longestRail}=require('./map');
const id=()=>crypto.randomBytes(12).toString('hex');
const stock=()=>({coal:1,timber:1,grain:1,steel:1,gold:2});
const zero=()=>({coal:0,timber:0,grain:0,steel:0,gold:0});
const byId=(room,tileId)=>room.tiles.find(t=>t.id===tileId);
const owned=(room,p)=>room.tiles.filter(t=>t.owner===p.id);
const typeTitle=t=>({coal:'Coalfield',forest:'Forest',farm:'Farmland',steel:'Steelworks',town:'Market Town',hill:'Hills',lake:'Lake',capital:'The Capital'}[t.type]||t.type);
const eraOf=(room,round=room.round)=>round<=room.settings.eras[0]?'steam':round<=room.settings.eras[0]+room.settings.eras[1]?'iron':'electric';
const advanced=room=>room.mode==='advanced';
const eraRank=era=>({steam:0,iron:1,electric:2})[era]??0;
const routeOpen=(room,r)=>eraRank(room.era)>=eraRank(r.era||'steam');
function eventIs(room,id){return advanced(room)&&room.event?.id===id;}
function avatar(p){return AVATARS.find(a=>a.id===p.avatar);}
function perk(room,p,key){return advanced(room)&&p.avatar===key;}
function has(p,u){return p.upgrades.includes(u);}
function tileNeighbours(room,tile){return neighbours(tile,new Map(room.tiles.map(t=>[t.id,t])));}
function addFeed(room,message,kind='news',extra={}){room.seq++;room.feed.push({seq:room.seq,at:Date.now(),message,kind,...extra});if(room.feed.length>40)room.feed.shift();}
function react(p,mood,reason=''){if(!p)return;p.reaction=mood;p.reactionReason=reason;p.reactionUntil=Date.now()+4000;}
function createRoom(code){return {code,hostToken:id(),mode:'standard',status:'lobby',round:0,era:'steam',deadline:0,seq:0,feed:[],players:[],tiles:[],routes:[],ticketDeck:[],events:[],event:null,placement:[],placementIndex:0,pending:[],clashes:[],revealCursor:0,offer:null,marketOffers:[],dividendsPaid:false,settings:MODE.standard,turnOffset:0,lastWinner:null,retiredAt:null};}
function addPlayer(room,name,ai=false){
 if(room.status!=='lobby')throw Error('This game has already started.');
 if(room.players.length>=8)throw Error('Room full (maximum eight players).');
 const clean=String(name||'').trim().slice(0,22).replace(/[<>]/g,'');
 if(!clean)throw Error('Enter your name.');
 const p={id:id(),token:id(),name:clean,seat:room.players.length,ai,avatar:null,connected:!!ai,resources:stock(),tickets:[],ticketChoices:[],upgrades:[],draftChoices:[],draftDone:false,actions:[null,null,null],locked:false,telegraphUsed:false,smuggleUsed:false,bankResource:'coal',bonusPrestige:0,endgameDividend:0,prestige:0,breakdown:{},tutorialDone:false,reaction:'neutral',reactionReason:'',reactionUntil:0};
 room.players.push(p);if(ai)chooseAvatar(room,p,AVATARS.find(a=>!room.players.some(x=>x!==p&&x.avatar===a.id)).id);
 addFeed(room,`${p.name} has joined the railway race.`);return p;
}
function chooseAvatar(room,p,avatarId){
 if(!['lobby','tickets'].includes(room.status))throw Error('Avatars can only be changed in the lobby.');
 const a=AVATARS.find(a=>a.id===avatarId);if(!a)throw Error('Unknown tycoon.');
 if(room.players.some(x=>x!==p&&x.avatar===avatarId))throw Error('This tycoon is already taken.');
 p.avatar=avatarId;addFeed(room,`${p.name} is playing as ${a.name}.`);
}
function startGame(room,mode,mapFactory=generateMap){
 if(room.status!=='lobby')throw Error('Game already started.');
 if(!MODE[mode])throw Error('Invalid mode.');
 if(room.players.length<2)throw Error('At least two players are required.');
 if(room.players.some(p=>!p.avatar))throw Error('Every player needs a tycoon.');
 const generated=mapFactory();room.tiles=generated.tiles;room.routes=generated.routes;room.ticketDeck=generated.deck;room.events=shuffle([...EVENTS]);room.mode=mode;room.settings=MODE[mode];room.round=0;room.era='steam';room.dividendsPaid=false;room.revealStart=Math.floor(Math.random()*room.players.length);
 for(const p of room.players){p.resources=stock();p.tickets=[];p.ticketChoices=room.ticketDeck.splice(0,3);p.upgrades=[];p.actions=[null,null,null];p.locked=false;p.prestige=0;p.bonusPrestige=0;p.endgameDividend=0;p.reaction='neutral';p.reactionUntil=0;p.reactionReason='';}
 room.status='tickets';room.deadline=Date.now()+45_000;addFeed(room,'The Crown has summoned the railway tycoons! Choose your tickets.','era');
 autopilot(room);
}
function chooseTickets(room,p,ids){
 if(room.status!=='tickets'||!p.ticketChoices.length)throw Error('No tickets to choose.');
 if(!Array.isArray(ids)||ids.length<2||ids.length>3||new Set(ids).size!==ids.length)throw Error('Keep two or three tickets.');
 if(ids.some(x=>!p.ticketChoices.some(t=>t.id===x)))throw Error('Invalid ticket selection.');
 p.tickets=p.ticketChoices.filter(t=>ids.includes(t.id));room.ticketDeck.push(...p.ticketChoices.filter(t=>!ids.includes(t.id)));p.ticketChoices=[];addFeed(room,`${p.name} has sealed their destinations.`);
 if(room.players.every(x=>!x.ticketChoices.length))beginPlacement(room);
}
function beginPlacement(room){
 room.status='placement';const first=shuffle(room.players.map(p=>p.id));room.placement=[...first,...first.slice().reverse()];room.placementIndex=0;room.deadline=Date.now()+35_000;addFeed(room,'Place your first depots. The starting order reverses halfway.','era');autopilot(room);
}
function placeDepot(room,p,tileId){
 if(room.status!=='placement'||room.placement[room.placementIndex]!==p.id)throw Error('It is not your placement turn.');
 const tile=byId(room,tileId);if(!tile||!['coal','forest','farm','steel'].includes(tile.type)||tile.owner)throw Error('Choose a vacant production tile.');
 tile.owner=p.id;tile.soldiers=1;addFeed(room,`${p.name} founded a depot in the ${typeTitle(tile)}.`, 'build',{tile:tile.id,player:p.id});
 room.placementIndex++;room.deadline=Date.now()+35_000;
 if(room.placementIndex>=room.placement.length)startRound(room);else autopilot(room);
}
function validEraChoice(room,p,choice){return UPGRADES[room.era].some(u=>u.id===choice)&&!p.upgrades.includes(choice);}
function beginDraft(room){
 room.status='draft';room.deadline=Date.now()+40_000;
 for(const p of room.players){p.draftDone=false;p.draftChoices=UPGRADES[room.era].filter(u=>!p.upgrades.includes(u.id));
 // The documented nine-card deck has only three unique cards per era. Vex sees a fourth display option
 // (a duplicate wildcard selection) without inventing a tenth gameplay effect.
 if(perk(room,p,'ottoline'))p.draftChoices=[...p.draftChoices,{id:'wildcard',name:'Experimental Patent',detail:'Commission one randomly chosen available upgrade from this era.'}];
 }
 addFeed(room,`${room.era.toUpperCase()} ERA — Choose your industrial advantage.`,'era');autopilot(room);
}
function chooseUpgrade(room,p,choice,bankResource){
 if(room.status!=='draft'||p.draftDone)throw Error('Upgrade selection is closed.');
 if(choice==='wildcard'&&perk(room,p,'ottoline')){const available=UPGRADES[room.era].filter(u=>!p.upgrades.includes(u.id));if(!available.length)throw Error('No era upgrades remain.');choice=shuffle([...available])[0].id;}
 if(!validEraChoice(room,p,choice))throw Error('This upgrade is unavailable.');
 grantUpgrade(room,p,choice);p.draftDone=true;
 if(['coal','timber','grain','steel'].includes(bankResource))p.bankResource=bankResource;
 if(room.players.every(x=>x.draftDone))beginIncome(room);
}
function grantUpgrade(room,p,choice){
 p.upgrades.push(choice);
 const u=Object.values(UPGRADES).flat().find(u=>u.id===choice);addFeed(room,`${p.name} developed ${u?.name||choice}.`,'upgrade',{player:p.id});
 if(choice==='militia')grantSoldiers(room,p,2);
 if(choice==='station')assignGrandStation(room,p);
}
function grantSoldiers(room,p,count){const tiles=owned(room,p);if(tiles.length)tiles[0].soldiers+=count;}
function assignGrandStation(room,p){
 if(!has(p,'station'))return;
 const current=owned(room,p).find(t=>t.grand);if(current)return;
 const city=owned(room,p).filter(t=>t.city).sort((a,b)=>(a.cityOn||0)-(b.cityOn||0))[0];if(city)city.grand=true;
}
function startRound(room){
 room.round++;room.era=eraOf(room);room.event=advanced(room)?room.events[room.round-1]:null;room.turnOffset=((room.revealStart||0)+room.round-1)%room.players.length;
 for(const p of room.players){p.actions=[null,null,null];p.locked=false;p.telegraphUsed=false;p.smuggleUsed=false;}
 room.routes.forEach(r=>r.blocked=false);
 if(room.round>1&&eraOf(room,room.round-1)!==room.era){
  const introduced=room.routes.filter(r=>r.era===room.era);
  if(introduced.length)addFeed(room,room.era==='iron'
   ?'IRON ERA — Three new Lake Viaduct charters are open!'
   :'ELECTRIC ERA — Three new Capital Express charters are open!',
   'era',{routes:introduced.map(r=>r.id),newRoutes:true});
 }
 if(eventIs(room,'collapse')){const openRoutes=room.routes.filter(r=>routeOpen(room,r));const r=openRoutes[Math.floor(Math.random()*openRoutes.length)];r.blocked=true;addFeed(room,`BRIDGE COLLAPSE — ${routeName(room,r)} has closed!`,'event');}
 if(room.round===1||eraOf(room,room.round-1)!==room.era){
  if(room.round>1)for(const p of room.players)if(has(p,'militia'))grantSoldiers(room,p,1);
  beginDraft(room);
 }else beginIncome(room);
}
function beginIncome(room){
 room.status='income';room.deadline=Date.now()+5_500;
 if(room.event)addFeed(room,`THE DAILY GAZETTE: ${room.event.name} — ${room.event.detail}`,'event');
 const last=Math.min(...room.players.map(p=>p.prestige));
 for(const p of room.players){const gain=zero();
  for(const t of owned(room,p)){
    if(eventIs(room,'flood')&&tileNeighbours(room,t).some(n=>n.type==='lake'))continue;
    if(t.type==='coal'&&(!eventIs(room,'strike')||perk(room,p,'nell')))gain.coal++;
    if(t.type==='forest')gain.timber++;
    if(t.type==='farm'&&(!eventIs(room,'winter')||perk(room,p,'nell')))gain.grain++;
    if(t.type==='steel')gain.steel++;
    if(t.type==='town')gain.gold+=t.city?2:1;
    if(t.type==='hill')gain.gold+=eventIs(room,'rush')?2:room.era==='steam'?0:1;
  }
  for(const r of room.routes.filter(r=>r.owner===p.id&&!r.blocked))gain.gold+=(r.era==='electric'?2:1)+(has(p,'express')?1:0)+(r.a==='0,0'||r.b==='0,0'?1:0);
  if(eventIs(room,'boom'))for(const k of Object.keys(gain))gain[k]*=2;
  if(p.prestige===last)gain.gold++;
  for(const k of Object.keys(gain))p.resources[k]+=gain[k];
  addFeed(room,`${p.name} collected ${Object.entries(gain).filter(([,v])=>v>0).map(([k,v])=>`${v} ${k}`).join(', ')}.`,'income',{player:p.id});
  if(!owned(room,p).length){const free=room.tiles.filter(t=>!t.owner&&['coal','forest','farm','steel'].includes(t.type));if(free.length){const t=free[Math.floor(Math.random()*free.length)];t.owner=p.id;t.soldiers=1;addFeed(room,`${p.name} returns to the game with a free depot!`,'build',{tile:t.id,player:p.id});}}
 }
 updatePrestige(room);
}
function beginPlan(room){room.status='plan';room.deadline=Date.now()+room.settings.plan*1000;addFeed(room,`ROUND ${room.round} — Secret orders are open.`);autopilot(room);}
function routeName(room,r){return `${byId(room,r.a)?.name||'Station'}–${byId(room,r.b)?.name||'Station'}`;}
function costOf(room,p,action){
 const c=zero();switch(action.type){
 case 'build':c.timber=1;c.grain=1;break;
 case 'city':c.grain=2-(perk(room,p,'augusta')?1:0);c.steel=2-(has(p,'bessemer')?1:0);c.coal=1;break;
 case 'track':{const r=room.routes.find(r=>r.id===action.route);if(!r)throw Error('Unknown route.');
  const fresh=additionalSegments(room,p,r);c.timber=Math.max(0,fresh-(has(p,'navvies')?1:0));c.steel=Math.max(0,fresh-(perk(room,p,'silas')?1:0));
  if(eventIs(room,'mania')){c.timber=Math.ceil(c.timber/2);c.steel=Math.ceil(c.steel/2);}break;}
 case 'recruit':c.gold=action.count*(eventIs(room,'recruit')||perk(room,p,'rupert')?1:2);break;
 case 'research':c.gold=Math.max(0,3-(perk(room,p,'ottoline')?1:0)-(eventIs(room,'fair')?1:0));c.coal=1;break;
 case 'trade':if(action.kind==='bank'){const ratio=tradeRate(room,p,action.give);c[action.give]=ratio;}else Object.assign(c,action.give||{});break;
 }
 return c;
}
function tradeRate(room,p,resource){
 // An economy-wide Market Crash temporarily supersedes individual discounts.
 if(eventIs(room,'crash'))return 4;
 if(perk(room,p,'ada')&&p.bankResource===resource)return 2;
 if(resource==='grain'&&has(p,'corn'))return 2;
 return 3;
}
function legalTargets(room,p){
 const ownerTiles=owned(room,p), reachable=new Set(ownerTiles.map(t=>t.id));
 const trackReachable=new Set(reachable);for(const t of ownerTiles)tileNeighbours(room,t).forEach(n=>trackReachable.add(n.id));
 const ownRailPath=new Set(room.routes.filter(r=>r.owner===p.id).flatMap(r=>r.path));
 const rivalEdges=new Set(room.routes.filter(r=>r.owner&&r.owner!==p.id).flatMap(routeEdges));
 for(const t of ownerTiles)tileNeighbours(room,t).forEach(n=>reachable.add(n.id));
 for(const r of room.routes.filter(r=>r.owner===p.id))for(const tid of r.path){const t=byId(room,tid);if(t)tileNeighbours(room,t).forEach(n=>reachable.add(n.id));reachable.add(tid);}
 return {
 build:room.tiles.filter(t=>!t.owner&&!['lake','capital'].includes(t.type)&&reachable.has(t.id)&&ownerTiles.length).map(t=>t.id),
 city:ownerTiles.filter(t=>t.type==='town'&&!t.city).map(t=>t.id),
 track:room.routes.filter(r=>routeOpen(room,r)&&!r.owner&&!r.blocked&&!routeEdges(r).some(e=>rivalEdges.has(e))&&(r.path.some(id=>trackReachable.has(id))||ownRailPath.has(r.a)||ownRailPath.has(r.b))).map(r=>r.id),
 recruit:ownerTiles.map(t=>t.id),
 attack:eventIs(room,'peace')?[]:room.tiles.filter(t=>t.owner&&t.owner!==p.id&&tileNeighbours(room,t).some(n=>n.owner===p.id&&n.soldiers>0)).map(t=>t.id)
 };
}
// Track sections are real hex-to-hex edges, so rival empires cannot
// simultaneously own the same physical line. Routes may reuse your own rails.
function routeEdges(route){const edges=[];for(let i=1;i<route.path.length;i++)edges.push([route.path[i-1],route.path[i]].sort().join('|'));return edges;}
function blockedByRival(room,p,route){const target=new Set(routeEdges(route));return room.routes.some(other=>other.owner&&other.owner!==p.id&&routeEdges(other).some(edge=>target.has(edge)));}
function additionalSegments(room,p,route){const ownedEdges=new Set(room.routes.filter(r=>r.owner===p.id).flatMap(routeEdges));return routeEdges(route).filter(edge=>!ownedEdges.has(edge)).length;}
function routeAccessible(room,p,route){
 const ownedTiles=owned(room,p),reachable=new Set(ownedTiles.map(t=>t.id));
 for(const t of ownedTiles)for(const n of tileNeighbours(room,t))reachable.add(n.id);
 if(route.path.some(id=>reachable.has(id)))return true;
 const ownRail=new Set(room.routes.filter(r=>r.owner===p.id).flatMap(r=>r.path));
 return ownRail.has(route.a)||ownRail.has(route.b);
}
function cleanResources(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Invalid resource offer.');
 const out=zero();for(const [k,v] of Object.entries(raw)){
  if(!Object.hasOwn(out,k)||!Number.isInteger(v)||v<0||v>99)throw Error('Invalid resource amount.');out[k]=v;
 }return out;
}
function validateAction(room,p,a){
 if(!a||typeof a!=='object'||typeof a.type!=='string')throw Error('Choose a valid action.');
 const legal=legalTargets(room,p);let out={type:a.type};
 switch(a.type){
 case 'skip':break;
 case 'build':if(!legal.build.includes(a.tile))throw Error('Choose an available adjacent tile.');out.tile=a.tile;break;
 case 'city':if(!legal.city.includes(a.tile))throw Error('You must own an undeveloped Market Town.');out.tile=a.tile;break;
 case 'track':if(!legal.track.includes(a.route))throw Error('Route needs a connected depot or track and no rival-owned segments.');out.route=a.route;break;
 case 'recruit':if(!legal.recruit.includes(a.tile)||!Number.isInteger(a.count)||a.count<1||a.count>3)throw Error('Recruit 1–3 soldiers on one of your tiles.');out.tile=a.tile;out.count=a.count;break;
 case 'research':if(!['ticket','upgrade'].includes(a.kind))throw Error('Choose a research reward.');out.kind=a.kind;
  if(a.kind==='upgrade'){
    if(!validEraChoice(room,p,a.upgrade))throw Error('Choose an available era upgrade.');out.upgrade=a.upgrade;
  }break;
 case 'trade':
  if(a.kind==='bank'){
   if(!['coal','timber','grain','steel','gold'].includes(a.give)||!['coal','timber','grain','steel','gold'].includes(a.want)||a.give===a.want)throw Error('Choose different resources to trade.');
   out.kind='bank';out.give=a.give;out.want=a.want;
  }else if(a.kind==='player'){
   const other=room.players.find(x=>x.id===a.to);if(!other||other.id===p.id)throw Error('Choose another player.');
   out.kind='player';out.to=other.id;out.give=cleanResources(a.give);out.want=cleanResources(a.want);
   if(!Object.values(out.give).some(Boolean)||!Object.values(out.want).some(Boolean))throw Error('Both sides must offer something.');
  }else throw Error('Choose bank or player trade.');break;
 case 'attack':
  if(!legal.attack.includes(a.tile))throw Error('Choose an adjacent enemy tile with available troops.');
  if(!Array.isArray(a.sources)||!a.sources.length||a.sources.length>6)throw Error('Commit soldiers from adjacent tiles.');
  out.tile=a.tile;out.sources=[];const target=byId(room,a.tile);const seen=new Set();
  for(const src of a.sources){const t=byId(room,src.tile);if(!t||t.owner!==p.id||!tileNeighbours(room,target).some(x=>x.id===t.id)||!Number.isInteger(src.count)||src.count<1||src.count>t.soldiers||seen.has(src.tile))throw Error('Invalid troop commitment.');
   seen.add(src.tile);out.sources.push({tile:src.tile,count:src.count});
  }break;
 default:throw Error('Unknown action.');
 }
 return out;
}
function sumCost(c){return Object.values(c).reduce((a,b)=>a+b,0);}
function canPay(resources,c){return Object.keys(c).every(k=>resources[k]>=c[k]);}
function calculatePlanBudget(room,p,actions){
 const left={...p.resources};let researchCount=0;
 const soldierReservations=new Map();
 const buildClaims=new Set();
 for(const a of actions){if(!a)continue;if(a.type==='research'&&++researchCount>1)throw Error('Research can only be chosen once per round.');
  if(a.type==='build'){
   if(buildClaims.has(a.tile))throw Error('Choose a different tile for another Depot.');
   buildClaims.add(a.tile);
  }
  if(a.type==='attack')for(const src of a.sources){
   const count=(soldierReservations.get(src.tile)||0)+src.count;
   if(count>byId(room,src.tile).soldiers)throw Error('Soldiers cannot be committed to two attacks at once.');
   soldierReservations.set(src.tile,count);
  }
  const cost=costOf(room,p,a);if(!canPay(left,cost))throw Error('You cannot afford all planned actions.');
  for(const k of Object.keys(cost))left[k]-=cost[k];
  if(a.type==='trade'&&a.kind==='bank')left[a.want]++;
 }
 return left;
}
function setAction(room,p,slot,action){
 if(room.status!=='plan'||p.locked)throw Error('Planning is closed.');
 if(!Number.isInteger(slot)||slot<0||slot>=3)throw Error('Choose action slot 1, 2 or 3.');
 const verified=validateAction(room,p,action);
 const old=p.actions[slot];p.actions[slot]=verified;
 try{calculatePlanBudget(room,p,p.actions);}catch(err){p.actions[slot]=old;throw err;}
}
function lockIn(room,p){if(room.status!=='plan')throw Error('Planning is closed.');if(p.locked)throw Error('Already locked in.');
 p.actions=p.actions.map(a=>a||{type:'skip'});calculatePlanBudget(room,p,p.actions);p.locked=true;addFeed(room,`${p.name} has locked in their orders.`,'lock');
 if(room.players.every(x=>x.locked))beginReveal(room);
}
function beginReveal(room){room.status='reveal';room.deadline=Date.now()+(room.players.some(p=>has(p,'telegraph')&&!p.ai)?9000:1100);
 room.pending=[];room.clashes=[];room.revealCursor=0;room.offer=null;room.marketOffers=[];
 const ordered=[...room.players.slice(room.turnOffset),...room.players.slice(0,room.turnOffset)];
 for(const p of ordered)for(let slot=0;slot<3;slot++)room.pending.push({player:p.id,slot,action:p.actions[slot]||{type:'skip'}});
 addFeed(room,'ORDERS REVEALED — The railway companies make their moves!','reveal');
}
function attempt(room,p,action){
 if(action.type==='skip')return addFeed(room,`${p.name} passed an action.`);
 const cost=costOf(room,p,action);
 const fail=reason=>{react(p,'furious','Failed order');addFeed(room,`${p.name}: ${reason}. +1 Gold consolation.`,'fail',{player:p.id});p.resources.gold++;};
 if(!canPay(p.resources,cost))return fail('insufficient resources at Reveal');
 const t=action.tile?byId(room,action.tile):null;
 switch(action.type){
 case 'build':if(!legalTargets(room,p).build.includes(action.tile) && !room.clashes.some(c=>c.tile===action.tile&&c.claimants.some(x=>x.kind==='build')))return fail('depot location is unavailable');break;
 case 'city':if(!t||t.owner!==p.id||t.city||t.type!=='town')return fail('Market Town cannot be upgraded');break;
 case 'track':if(!legalTargets(room,p).track.includes(action.route))return fail('route was taken, disconnected or its era is locked');break;
 case 'recruit':if(!t||t.owner!==p.id)return fail('tile is no longer yours');break;
 case 'research':if(action.kind==='upgrade'&&!validEraChoice(room,p,action.upgrade))return fail('upgrade unavailable');break;
 case 'attack':if(!t||!t.owner||t.owner===p.id||eventIs(room,'peace'))return fail('target unavailable');
  if(!action.sources.every(s=>{const src=byId(room,s.tile);const already=room.clashes.flatMap(c=>c.claimants).filter(c=>c.kind==='attack').flatMap(c=>c.sources).filter(x=>x.tile===s.tile).reduce((n,x)=>n+x.count,0);return src?.owner===p.id&&src.soldiers-already>=s.count&&tileNeighbours(room,t).some(x=>x.id===s.tile);}))return fail('committed soldiers unavailable');break;
 case 'trade':if(action.kind==='player'&&!room.players.some(x=>x.id===action.to))return fail('trading partner unavailable');break;
 }
 for(const k of Object.keys(cost))p.resources[k]-=cost[k];
 switch(action.type){
 case 'build':{
  const group=room.clashes.find(c=>c.tile===t.id);if(group)group.claimants.push({player:p.id,kind:'build',sources:[],cost});
  else room.clashes.push({tile:t.id,claimants:[{player:p.id,kind:'build',sources:[],cost}],defender:t.owner});
  addFeed(room,`${p.name} has staked a claim on ${typeTitle(t)}.`,'claim',{tile:t.id,player:p.id});break;}
 case 'attack':{
  const group=room.clashes.find(c=>c.tile===t.id);if(group)group.claimants.push({player:p.id,kind:'attack',sources:action.sources,cost});
  else room.clashes.push({tile:t.id,claimants:[{player:p.id,kind:'attack',sources:action.sources,cost}],defender:t.owner});
  addFeed(room,`${p.name} marches on ${t.name||typeTitle(t)}!`,'attack',{tile:t.id,player:p.id});break;}
 case 'city':t.city=true;t.cityOn=Date.now();assignGrandStation(room,p);react(p,'smug','New city founded');addFeed(room,`${p.name} founded a new City at ${t.name}.`,'city',{tile:t.id,player:p.id});break;
 case 'track':{const r=room.routes.find(r=>r.id===action.route);r.owner=p.id;addFeed(room,`${p.name} completed the ${routeName(room,r)} railway!`,'track',{route:r.id,player:p.id});break;}
 case 'recruit':t.soldiers+=action.count;addFeed(room,`${p.name} recruited ${action.count} Soldier${action.count===1?'':'s'}.`,'recruit',{tile:t.id,player:p.id});break;
 case 'research':{
  if(action.kind==='ticket'){const ticket=room.ticketDeck.shift();if(ticket){p.tickets.push(ticket);addFeed(room,`${p.name} discovered a new Destination Ticket.`,'research',{player:p.id});}else p.resources.gold+=cost.gold,p.resources.coal+=cost.coal,addFeed(room,'All Destination Tickets have been claimed. Research refunded.');}
  else {grantUpgrade(room,p,action.upgrade);}break;}
 case 'trade':{
  if(action.kind==='bank'){p.resources[action.want]++;addFeed(room,`${p.name} traded with the bank for 1 ${action.want}.`,'trade',{player:p.id});}
  else {
   const to=room.players.find(x=>x.id===action.to);const favour=Object.values(action.give).reduce((a,b)=>a+b,0)===2*Object.values(action.want).reduce((a,b)=>a+b,0);
   const compelled=perk(room,p,'ezra')&&!p.smuggleUsed&&favour;
   if(compelled)p.smuggleUsed=true;
   // Offered goods are removed above and held as escrow. All offers share one
   // market window after the final order; the public view never reveals prices.
   const id=`M${room.round}-${room.marketOffers.length+1}`;
   room.marketOffers.push({id,from:p.id,to:to.id,give:action.give,want:action.want,compelled,answer:null});
   addFeed(room,`${p.name} lodged a sealed offer for ${to.name} at the Exchange.`,'trade',{player:p.id});
  }break;}
 }
}
function aiTradeAccept(offer,to){
 if(offer.compelled)return true;
 const amount=o=>Object.values(o).reduce((a,b)=>a+b,0);
 if(amount(offer.give)<amount(offer.want))return false;
 return Object.keys(offer.want).every(k=>to.resources[k]>=offer.want[k] &&
   (!['steel','timber'].includes(k)||to.resources[k]>offer.want[k]));
}
function settleMarket(room){
 if(room.status!=='market')return;
 // Resolution order is the original Reveal order, not response timing or seat.
 for(const offer of room.marketOffers){
  const from=room.players.find(p=>p.id===offer.from),to=room.players.find(p=>p.id===offer.to);
  if(!from||!to)continue;
  const accept=offer.answer===true&&canPay(to.resources,offer.want);
  if(accept){
   for(const k of Object.keys(offer.want)){to.resources[k]-=offer.want[k];from.resources[k]+=offer.want[k];}
   for(const k of Object.keys(offer.give))to.resources[k]+=offer.give[k];
  }else for(const k of Object.keys(offer.give))from.resources[k]+=offer.give[k];
  addFeed(room,`${to.name} ${accept?'accepted':'declined'} ${from.name}’s exchange offer.`,'trade',{player:from.id});
 }
 room.marketOffers=[];room.offer=null;room.status='reveal';room.deadline=Date.now()+700;
 resolveClashes(room);concludeRound(room);
}
function beginMarket(room){
 if(!room.marketOffers.length){resolveClashes(room);concludeRound(room);return;}
 room.status='market';room.deadline=Date.now()+20_000;
 for(const offer of room.marketOffers){
  if(offer.compelled)offer.answer=true;
  else {const to=room.players.find(p=>p.id===offer.to);
   if(to?.ai)offer.answer=aiTradeAccept(offer,to);}
 }
 addFeed(room,`THE EXCHANGE IS OPEN — ${room.marketOffers.length} sealed offer${room.marketOffers.length===1?'':'s'} await one shared market window.`,'market');
 if(room.marketOffers.every(offer=>offer.answer!==null))settleMarket(room);
}
function replyOffer(room,p,accept,offerId){
 if(room.status!=='market')throw Error('The Exchange is closed.');
 const available=room.marketOffers.filter(o=>o.to===p.id&&o.answer===null);
 const offer=offerId?available.find(o=>o.id===offerId):available.length===1?available[0]:null;
 if(!offer)throw Error('Choose a pending trade offer.');
 if(offer.compelled)accept=true;
 offer.answer=!!accept;
 addFeed(room,`${p.name} answered an offer at the Exchange.`,'market',{player:p.id});
 if(room.marketOffers.every(o=>o.answer!==null))settleMarket(room);
}
function die(room,p){const d=1+Math.floor(Math.random()*6);return perk(room,p,'jack')?Math.max(d,1+Math.floor(Math.random()*6)):d;}
function troopLoss(n){return Math.ceil(n/2);}
function resolveClashes(room){
 for(const group of room.clashes){
  const tile=byId(room,group.tile);
  if(!tile)continue;
  let contestants=[];
  if(tile.owner){const defender=room.players.find(p=>p.id===tile.owner);if(defender)contestants.push({player:defender.id,defender:true,kind:'defend',units:tile.soldiers,sources:[],cost:zero(),support:0});}
  for(const claim of group.claimants){
   const p=room.players.find(x=>x.id===claim.player);if(!p)continue;
   if(claim.kind==='build'){
    if(tile.owner){for(const k of Object.keys(claim.cost))p.resources[k]+=claim.cost[k];p.resources.gold++;react(p,'furious','Contested Depot');continue;}
    const support=tileNeighbours(room,tile).filter(t=>t.owner===p.id).reduce((n,t)=>n+t.soldiers,0);
    contestants.push({player:p.id,defender:false,kind:'build',units:0,sources:[],cost:claim.cost,support});
   }else{
    const units=claim.sources.reduce((n,s)=>n+Math.min(byId(room,s.tile)?.soldiers||0,s.count),0);
    if(units>0)contestants.push({player:p.id,defender:false,kind:'attack',units,sources:claim.sources,cost:claim.cost,support:0});
   }
  }
  if(!contestants.length)continue;
  // Multiple attack orders by one player merge; nobody rolls twice for one target.
  const combined=new Map();
  for(const c of contestants){const prior=combined.get(c.player);if(prior){prior.units+=c.units;prior.sources.push(...c.sources);prior.support+=c.support;}
   else combined.set(c.player,{...c,sources:[...c.sources]});}
  contestants=[...combined.values()];
  const strength=group=>{
   for(const c of group){const p=room.players.find(x=>x.id===c.player);
    c.roll=die(room,p);
    c.bonus=c.defender?((tile.type==='hill'?1:0)+(tile.city?1:0)+(has(p,'fort')?1:0)):c.kind==='attack'&&c.sources.some(s=>byId(room,s.tile)?.type==='hill')?1:0;
    c.strength=c.roll+c.units+c.bonus+c.support;
   }
  };
  strength(contestants);
  // Keep every claimant for refunds, casualties and the Gazette. Only the
  // highest-scoring tied finalists reroll; eliminated rivals still pay for a
  // lost attack or receive the full contested-Depot consolation.
  let tied=[],winner=null,rerolls=0,finalists=contestants;
  for(;;){
   const high=Math.max(...finalists.map(c=>c.strength));
   tied=finalists.filter(c=>c.strength===high);
   if(tied.length===1){winner=tied[0];break;}
   if(tied.some(c=>c.defender)){winner=tied.find(c=>c.defender);break;}
   if(rerolls>=3)break;
   rerolls++;
   finalists=tied;
   strength(finalists);
  }
  const result=contestants.map(c=>({id:c.player,roll:c.roll,score:c.strength,support:c.support,bonus:c.bonus}));
  if(!winner){
   for(const claim of group.claimants)if(claim.kind==='build'){
    const p=room.players.find(x=>x.id===claim.player);if(p){for(const k of Object.keys(claim.cost))p.resources[k]+=claim.cost[k];p.resources.gold++;react(p,'furious','Stalemate');}
   }
   addFeed(room,`Stalemate at ${tile.name||typeTitle(tile)} — no claimant takes the land!`,'clash',{tile:tile.id,stalemate:true,rerolls,results:result});
   continue;
  }
  const winP=room.players.find(p=>p.id===winner.player);
  for(const c of contestants){const p=room.players.find(x=>x.id===c.player);react(p,c===winner?'smug':'furious',c===winner?'Won a clash':'Lost a clash');
   if(c.kind==='build'&&c!==winner){for(const k of Object.keys(c.cost))p.resources[k]+=c.cost[k];p.resources.gold++;}
  }
  for(const c of contestants){const isWinner=c===winner;
   if(c.defender){if(isWinner)tile.soldiers=Math.max(0,tile.soldiers-1);else tile.soldiers=Math.max(0,tile.soldiers-troopLoss(tile.soldiers));}
   else if(c.kind==='attack'){
    let left=isWinner?Math.min(1,c.units):troopLoss(c.units);
    for(const troop of c.sources){const src=byId(room,troop.tile),take=Math.min(src?.soldiers||0,troop.count);if(src){src.soldiers-=take;
      const lost=Math.min(left,take);left-=lost;if(!isWinner)src.soldiers+=take-lost;
    }}
   }
  }
  const original=tile.owner;
  if(!winner.defender){tile.owner=winner.player;tile.soldiers=winner.kind==='build'?1:Math.max(0,winner.units-1);
   if(original&&original!==winner.player){tile.grand=false;assignGrandStation(room,room.players.find(p=>p.id===original));}}
  addFeed(room,`${winP.name} ${contestants.length===1?'secured':'won the clash for'} ${tile.name||typeTitle(tile)}! ${contestants.map(c=>`${room.players.find(p=>p.id===c.player)?.name}: ${c.roll}${c.support?`+${c.support} support`:''}${c.bonus?`+${c.bonus}`:''}`).join(' · ')}`,'clash',{tile:tile.id,player:winP.id,rerolls,results:result});
 }
 room.clashes=[];
}

function score(room,p){
 const depot=owned(room,p).filter(t=>t.type==='town'&&!t.city).length;
 const city=owned(room,p).filter(t=>t.city).length*2;
 // Completion is derived only from owned rail connections, never client assertions.
 const completed=p.tickets.filter(t=>ownsConnection(room.tiles,room.routes,p.id,t.a,t.b));
 const tickets=completed.reduce((acc,t)=>acc+t.value+(has(p,'directors')?1:0),0);
 const unfinished=advanced(room)?p.tickets.length-completed.length:0;
 const grand=owned(room,p).some(t=>t.grand)?2:0;
 // Each physically chartered railway scores Prestige: distinct trophies remain separate.
 const rail=room.routes.filter(r=>r.owner===p.id).reduce((sum,r)=>sum+({2:1,3:2,4:4,5:7}[r.segments]||0),0);
 const dividend=p.endgameDividend||0;
 const total=depot+city+rail+tickets+grand+p.bonusPrestige+dividend-unfinished;
 return {depot,city,rail,tickets,completed:completed.map(t=>t.id),unfinished,grand,bonus:p.bonusPrestige,dividend,total};
}
function updatePrestige(room){
 const oldTrophies={...(room.trophies||{})};
 const completedBefore=new Map(room.players.map(p=>[p.id,new Set(p.breakdown?.completed||[])]));
 const sc=room.players.map(p=>({p,s:score(room,p)}));
 let largestArmy=null;const bySoldiers=room.players.map(p=>({p,count:owned(room,p).reduce((n,t)=>n+t.soldiers,0)})).sort((a,b)=>b.count-a.count);
 if(bySoldiers[0].count>=5&&bySoldiers[0].count>bySoldiers[1]?.count)largestArmy=bySoldiers[0].p.id;
 let longest=null;const byRail=room.players.map(p=>({p,count:longestRail(room.routes.filter(r=>r.owner===p.id))})).sort((a,b)=>b.count-a.count);
 if(byRail[0].count>0&&byRail[0].count>byRail[1]?.count)longest=byRail[0].p.id;
 for(const {p,s} of sc){s.army=largestArmy===p.id?2:0;s.longest=longest===p.id?2:0;p.prestige=s.total+s.army+s.longest;p.breakdown=s;}
 room.trophies={army:largestArmy,rail:longest};
 for(const {p,s} of sc){const previous=completedBefore.get(p.id);if(s.completed.some(id=>!previous.has(id))){react(p,'smug','Destination completed');addFeed(room,`${p.name} fulfilled a secret railway contract!`,'ticket',{player:p.id});}}
 for(const key of ['army','rail']){const before=oldTrophies[key],after=room.trophies[key];if(before===after)continue;const name=key==='army'?'Largest Army':'Longest Railway';if(before){const loser=room.players.find(p=>p.id===before);react(loser,'furious',`Lost ${name}`);addFeed(room,`${loser?.name||'A company'} lost the ${name} trophy.`,'trophy',{player:before,change:'lost'});}if(after){const winner=room.players.find(p=>p.id===after);react(winner,'smug',`Won ${name}`);addFeed(room,`${winner?.name||'A company'} claimed the ${name} trophy!`,'trophy',{player:after,change:'won'});}}
}
function ownedTrackEdgeCount(room,p){return new Set(room.routes.filter(r=>r.owner===p.id).flatMap(routeEdges)).size;}
function completedTicketCount(room,p){return p.tickets.filter(t=>ownsConnection(room.tiles,room.routes,p.id,t.a,t.b)).length;}
function comparePlayers(room,a,b){return b.prestige-a.prestige||b.resources.gold-a.resources.gold||ownedTrackEdgeCount(room,b)-ownedTrackEdgeCount(room,a)||completedTicketCount(room,b)-completedTicketCount(room,a);}
// Final Royal Ledger: accumulated freight and liquid Gold now have a useful
// strategic purpose, without allowing early-turn resource hoarding to end games.
// This diversifies the victory economy while keeping rail routes the main scorer.
function royalDividend(resources,mode='standard'){
 const goods=['coal','timber','grain','steel'].reduce((sum,key)=>sum+Math.max(0,Number(resources?.[key])||0),0);
 const gold=Math.max(0,Number(resources?.gold)||0);
 return Math.min(3,Math.floor(goods/8))+Math.min(mode==='advanced'?5:3,Math.floor(gold/4));
}
function concludeRound(room){
 if(eventIs(room,'royal')){
  const count=room.players.map(p=>({p,n:owned(room,p).filter(t=>t.city).length})).sort((a,b)=>b.n-a.n);
  if(count[0].n>0&&count[0].n>count[1]?.n){count[0].p.bonusPrestige++;addFeed(room,`${count[0].p.name} earns a Royal Visit Prestige!`,'event');}
 }
 // The Royal Ledger pays only at the scheduled final round, once per game.
 // No early victory can be manufactured by passive stockpiling.
 if(room.round>=room.settings.rounds&&!room.dividendsPaid){
  for(const p of room.players)p.endgameDividend=royalDividend(p.resources,room.mode);
  room.dividendsPaid=true;
  addFeed(room,'THE FINAL ROYAL LEDGER — The Crown recognises Gold reserves and industry stockpiles.','event');
 }
 updatePrestige(room);
 const ranking=[...room.players].sort((a,b)=>comparePlayers(room,a,b));
 const finish=ranking[0].prestige>=room.settings.target||room.round>=room.settings.rounds;
 if(finish){
  const crowned=ranking.filter(p=>comparePlayers(room,p,ranking[0])===0);
  room.status='finished';room.lastWinner=crowned.length===1?crowned[0].id:null;
  room.sharedWinners=crowned.map(p=>p.id);room.deadline=0;
  for(const p of crowned)react(p,'smug','Crowned champion');
  if(crowned.length===1)addFeed(room,`THE CROWN GOES TO ${crowned[0].name.toUpperCase()}! ${crowned[0].prestige} Prestige.`,'win',{player:crowned[0].id});
  else addFeed(room,`SHARED CROWN — ${crowned.map(p=>p.name).join(' & ')} finish level on every tiebreak with ${crowned[0].prestige} Prestige!`,'win',{players:room.sharedWinners,shared:true});
 }else startRound(room);
}
function revealStep(room){
 if(room.status!=='reveal')return;
 if(room.revealCursor>=room.pending.length){beginMarket(room);return;}
 const entry=room.pending[room.revealCursor++],p=room.players.find(p=>p.id===entry.player);
 attempt(room,p,entry.action);updatePrestige(room);
 if(room.status==='reveal')room.deadline=Date.now()+1050;
}
function telegraph(room,p,slot,raw){
 if(room.status!=='reveal'||!has(p,'telegraph')||p.telegraphUsed)throw Error('No Telegraph change available.');
 const idx=room.pending.findIndex((e,i)=>i>=room.revealCursor&&e.player===p.id&&e.slot===slot);
 if(idx<0)throw Error('That order has already been resolved.');
 const action=validateAction(room,p,raw);
 const everyOrder=room.pending.filter(e=>e.player===p.id).map(e=>e===room.pending[idx]?action:e.action);
 if(everyOrder.filter(a=>a.type==='research').length>1)throw Error('Research can only be chosen once per round.');
 const outstanding=room.pending.filter((e,i)=>i>=room.revealCursor&&e.player===p.id).map(e=>e===room.pending[idx]?action:e.action);
 calculatePlanBudget(room,p,outstanding);
 p.telegraphUsed=true;room.pending[idx].action=action;addFeed(room,`${p.name} intercepted an order by Telegraph!`,'upgrade');
}
// Production AI uses the same authoritative validation and joint budget as humans.
// The seedable simulation's independent "random" bot is retained as a comparison.
function gridDistance(a,b){if(!a||!b)return 99;return (Math.abs(a.q-b.q)+Math.abs(a.r-b.r)+Math.abs(a.q+a.r-b.q-b.r))/2;}
function aiTicketChoices(room,p){const tile=id=>byId(room,id);return [...p.ticketChoices].sort((a,b)=>gridDistance(tile(a.a),tile(a.b))-gridDistance(tile(b.a),tile(b.b))).slice(0,2).map(x=>x.id);}
function aiBestPlacement(room,p){
 const free=room.tiles.filter(t=>!t.owner&&['coal','forest','farm','steel'].includes(t.type));
 const towns=room.tiles.filter(t=>t.type==='town');
 const production={coal:'coal',forest:'timber',farm:'grain',steel:'steel'};
 return free.sort((a,b)=>{
  const rank=t=>Math.min(...towns.map(z=>gridDistance(t,z)))*20+owned(room,p).filter(x=>production[x.type]===production[t.type]).length*7;
  return rank(a)-rank(b)||a.id.localeCompare(b.id);
 })[0]?.id;
}
function aiDraftChoice(room,p){
 let wanted=room.era==='steam'?'navvies':room.era==='iron'?'express':
  owned(room,p).some(t=>t.city)?'station':p.tickets.length>=2?'directors':'telegraph';
 return p.draftChoices.some(x=>x.id===wanted)?wanted:p.draftChoices.find(x=>x.id!=='wildcard')?.id;
}
function aiCandidates(room,p){
 const legal=legalTargets(room,p),tile=id=>byId(room,id),list=[];
 const own=owned(room,p),towns=room.tiles.filter(t=>t.type==='town');
 for(const id of legal.city)if(!p.actions.some(a=>a?.type==='city'&&a.tile===id))list.push({type:'city',tile:id,rank:105});
 for(const id of legal.track){
  if(p.actions.some(a=>a?.type==='track'&&a.route===id))continue;
  const r=room.routes.find(x=>x.id===id);if(!r)continue;
  const progress=p.tickets.filter(t=>!ownsConnection(room.tiles,room.routes,p.id,t.a,t.b)).reduce((n,t)=>n+(r.path.includes(t.a)?1:0)+(r.path.includes(t.b)?1:0),0);
  list.push({type:'track',route:id,rank:64+progress*12+r.segments*2-additionalSegments(room,p,r)});
 }
 for(const id of legal.build){
  const t=tile(id),distance=Math.min(...towns.map(x=>gridDistance(t,x)));
  const duplicate=own.filter(o=>o.type===t.type).length;
  list.push({type:'build',tile:id,rank:t.type==='town'?95:63-distance*4-duplicate*7});
 }
 for(const id of legal.attack){
  const target=tile(id),sources=tileNeighbours(room,target).filter(x=>x.owner===p.id&&x.soldiers>0).sort((a,b)=>b.soldiers-a.soldiers),strongest=sources[0];
  if(strongest&&strongest.soldiers-target.soldiers>=2)
   list.push({type:'attack',tile:id,sources:[{tile:strongest.id,count:strongest.soldiers}],rank:43});
 }
 const troops=own.filter(t=>t.soldiers<3&&tileNeighbours(room,t).some(x=>x.owner&&x.owner!==p.id));
 if(troops.length&&p.resources.gold>=5)list.push({type:'recruit',tile:troops[0].id,count:2,rank:28});
 if(room.ticketDeck.length&&p.tickets.filter(t=>!ownsConnection(room.tiles,room.routes,p.id,t.a,t.b)).length<2)
  list.push({type:'research',kind:'ticket',rank:26});
 // Trades target a shortage without wasting the last useful production resource.
 for(const give of ['gold','coal','grain','steel','timber']){
  const n=p.resources[give],rate=tradeRate(room,p,give);
  if(n<rate+1)continue;
  for(const want of ['steel','timber','grain','coal'])if(want!==give&&p.resources[want]<2)
   list.push({type:'trade',kind:'bank',give,want,rank:22-p.resources[want]*3+(give==='gold'?1:0)});
 }
 list.push({type:'skip',rank:-100});
 return list.sort((a,b)=>b.rank-a.rank||String(a.tile||a.route||a.type).localeCompare(String(b.tile||b.route||b.type)));
}
function autopilot(room){
 for(const p of room.players.filter(x=>x.ai)){
  if(room.status==='tickets'&&p.ticketChoices.length)chooseTickets(room,p,aiTicketChoices(room,p));
  if(room.status==='draft'&&!p.draftDone){const choice=aiDraftChoice(room,p);if(choice)chooseUpgrade(room,p,choice);}
 }
 if(room.status==='placement'){
  const p=room.players.find(p=>p.id===room.placement[room.placementIndex]);
  if(p?.ai){const id=aiBestPlacement(room,p);if(id)placeDepot(room,p,id);}
 }
 if(room.status==='plan')for(const p of room.players.filter(x=>x.ai&&!x.locked)){
  for(let slot=0;slot<p.actions.length;slot++){
   let chosen=false;
   for(const item of aiCandidates(room,p)){
    const {rank,...action}=item;
    try{setAction(room,p,slot,action);chosen=true;break;}catch{}
   }
   if(!chosen)setAction(room,p,slot,{type:'skip'});
  }
  lockIn(room,p);
 }
}
function tick(room,now=Date.now()){
 if(!room.deadline||now<room.deadline)return false;
 if(room.status==='tickets'){
  for(const p of room.players)if(p.ticketChoices.length)chooseTickets(room,p,p.ticketChoices.slice(0,2).map(t=>t.id));return true;
 }
 if(room.status==='placement'){
  const p=room.players.find(p=>p.id===room.placement[room.placementIndex]);if(p){const choices=room.tiles.filter(t=>!t.owner&&['coal','forest','farm','steel'].includes(t.type));if(choices.length)placeDepot(room,p,shuffle(choices)[0].id);}return true;
 }
 if(room.status==='draft'){
  for(const p of room.players)if(!p.draftDone)chooseUpgrade(room,p,p.draftChoices[0].id);return true;
 }
 if(room.status==='income'){beginPlan(room);return true;}
 if(room.status==='plan'){for(const p of room.players)if(!p.locked)lockIn(room,p);return true;}
 if(room.status==='market'){for(const o of room.marketOffers)if(o.answer===null)o.answer=false;settleMarket(room);return true;}
 if(room.status==='reveal'){revealStep(room);return true;}
 return false;
}
function publicView(room){return {code:room.code,mode:room.mode,status:room.status,round:room.round,totalRounds:room.settings.rounds,winTarget:room.settings.target,era:room.era,deadline:room.deadline,turnOffset:room.turnOffset,event:room.event,tiles:room.tiles,routes:room.routes.filter(r=>routeOpen(room,r)).map(r=>({id:r.id,a:r.a,b:r.b,path:r.path,segments:r.segments,era:r.era||'steam',owner:r.owner,blocked:r.blocked})),players:room.players.map(p=>({id:p.id,name:p.name,seat:p.seat,avatar:p.avatar,connected:p.connected,ai:p.ai,prestige:p.prestige,locked:p.locked,breakdown:Object.fromEntries(Object.entries(p.breakdown||{}).filter(([key])=>key!=='completed')),reaction:p.reactionUntil>Date.now()?p.reaction:'neutral',reactionUntil:p.reactionUntil,reactionReason:p.reactionUntil>Date.now()?p.reactionReason:''})),trophies:room.trophies||{},feed:room.feed.slice(-18),seq:room.seq,placementTurn:room.placement[room.placementIndex]||null,placementIndex:room.placementIndex,placementTotal:room.placement.length,market:room.status==='market'?{deadline:room.deadline,offers:room.marketOffers.map(o=>({id:o.id,from:o.from,to:o.to,answered:o.answer!==null}))}:null,offer:null,winner:room.lastWinner,winners:room.status==='finished'?(room.sharedWinners||[room.lastWinner]).filter(Boolean):null,finalRanking:room.status==='finished'?[...room.players].sort((a,b)=>comparePlayers(room,a,b)).map(p=>p.id):null};}
function privateView(room,p){return {playerId:p.id,token:p.token,resources:p.resources,tickets:p.tickets,ticketProgress:p.tickets.map(t=>({id:t.id,complete:ownsConnection(room.tiles,room.routes,p.id,t.a,t.b),prestige:t.value+(has(p,'directors')?1:0)})),ticketChoices:p.ticketChoices,upgrades:p.upgrades,draftChoices:p.draftChoices,draftDone:p.draftDone,actions:p.actions,locked:p.locked,avatar:p.avatar,bankResource:p.bankResource,telegraphUsed:p.telegraphUsed,planBalance:room.status==='plan'?calculatePlanBudget(room,p,p.actions):null,bankRates:Object.fromEntries(Object.keys(p.resources).map(k=>[k,tradeRate(room,p,k)])),legal:['placement','plan','reveal'].includes(room.status)?legalTargets(room,p):null,placementTurn:room.status==='placement'&&room.placement[room.placementIndex]===p.id,offers:room.status==='market'?room.marketOffers.filter(o=>o.to===p.id).map(o=>({...o,deadline:room.deadline})):[],offer:null};}
module.exports={createRoom,addPlayer,chooseAvatar,startGame,chooseTickets,placeDepot,chooseUpgrade,setAction,lockIn,replyOffer,telegraph,publicView,privateView,tick,autopilot,legalTargets,costOf,tradeRate,score,updatePrestige,beginIncome,beginPlan,revealStep,beginReveal,resolveClashes,owned,routeName,eraOf,avatar,royalDividend};
