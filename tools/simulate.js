#!/usr/bin/env node
'use strict';
/* Deterministic headless simulations. Only calls the authoritative game engine. */
const game=require('../src/game');
const {AVATARS,UPGRADES,MODE}=require('../src/constants');
const {distance,ownsConnection,generateMap,shuffle}=require('../src/map');
function args(argv){const o={players:4,mode:'standard',games:2000,seed:20261023,bots:'greedy',maps:128,target:null};for(let i=0;i<argv.length;i++){
 const k=argv[i];if(!k.startsWith('--'))throw Error('Unexpected argument '+k);
 const name=k.slice(2);if(!(name in o))throw Error('Unknown option '+k);o[name]=argv[++i];
 }o.players=Number(o.players);o.games=Number(o.games);o.seed=Number(o.seed);o.maps=Number(o.maps);if(o.target!==null)o.target=Number(o.target);
 if(!Number.isInteger(o.players)||o.players<2||o.players>8||!Number.isInteger(o.games)||o.games<1||o.games>100000||!Number.isInteger(o.seed)||!Number.isInteger(o.maps)||o.maps<1||o.maps>2000||(o.target!==null&&(!Number.isInteger(o.target)||o.target<5||o.target>100))||!MODE[o.mode]||!['greedy','random','mixed'].includes(o.bots))throw Error('Invalid options: --players 2..8 --mode quick|standard|advanced --games N --seed N --bots greedy|random|mixed');return o;}
function seedRandom(seed){let s=seed>>>0||1;return ()=>{s=(s+0x6D2B79F5)>>>0;let t=Math.imul(s^(s>>>15),1|s);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296;};}
const pick=(list,rng)=>list[Math.floor(rng()*list.length)];
function bestPlacement(room,p,rng){const choices=room.tiles.filter(t=>!t.owner&&['coal','forest','farm','steel'].includes(t.type));const towns=room.tiles.filter(t=>t.type==='town');if(!choices.length)throw Error('No available starting tiles');
 const production={coal:'coal',forest:'timber',farm:'grain',steel:'steel'};
 const sorted=choices.map(t=>({tile:t,score:Math.min(...towns.map(z=>distance(t,z)))*20+room.tiles.filter(z=>z.owner===p.id&&production[z.type]===production[t.type]).length*2+rng()*0.5})).sort((a,b)=>a.score-b.score);return sorted[0].tile.id;
}
function selectedTickets(room,p){const d=(t)=>{const a=room.tiles.find(z=>z.id===t.a),b=room.tiles.find(z=>z.id===t.b);return a&&b?distance(a,b):100;};return [...p.ticketChoices].sort((a,b)=>d(a)-d(b)).slice(0,2).map(t=>t.id);}
function draft(room,p){const id=room.era==='steam'?'navvies':room.era==='iron'?'express':game.owned(room,p).some(t=>t.city)?'station':p.tickets.length>=2?'directors':'telegraph';
 return p.draftChoices.some(x=>x.id===id)?id:p.draftChoices[0].id;}
function candidates(room,p,rng,mode){const legal=game.legalTargets(room,p);const L=[];
 for(const tile of legal.city)L.push({type:'city',tile,rank:100});
 const byId=id=>room.tiles.find(t=>t.id===id);
 const ownedRail=room.routes.filter(r=>r.owner===p.id);
 for(const id of legal.track){const r=room.routes.find(x=>x.id===id);const progress=p.tickets.reduce((n,t)=>n+(r.path.includes(t.a)||r.path.includes(t.b)?1:0),0);
 L.push({type:'track',route:id,rank:65+r.segments+progress*9+(r.segments>=4?3:0)});}
 for(const id of legal.build){const tile=byId(id);const towns=room.tiles.filter(x=>x.type==='town');const nearest=Math.min(...towns.map(t=>distance(t,tile)));
 L.push({type:'build',tile:id,rank:tile.type==='town'?90:52-nearest*3-(game.owned(room,p).filter(x=>x.type===tile.type).length*5)});}
 if(legal.attack.length)for(const id of legal.attack){const tile=byId(id);const source=game.owned(room,p).filter(t=>t.soldiers>0&&Math.max(Math.abs(t.q-tile.q),Math.abs(t.r-tile.r),Math.abs(t.q+t.r-tile.q-tile.r))===1).sort((a,b)=>b.soldiers-a.soldiers)[0];
 if(source&&source.soldiers-tile.soldiers>=2)L.push({type:'attack',tile:id,sources:[{tile:source.id,count:source.soldiers}],rank:40});}
 if(legal.recruit.length&&game.owned(room,p).some(t=>room.tiles.some(x=>x.owner&&x.owner!==p.id&&distance(t,x)===1)))L.push({type:'recruit',tile:legal.recruit[0],count:2,rank:23});
 if(p.tickets.filter(t=>!ownsConnection(room.tiles,room.routes,p.id,t.a,t.b)).length<2&&room.ticketDeck.length)L.push({type:'research',kind:'ticket',rank:19});
 const stock=Object.entries(p.resources).sort((a,b)=>b[1]-a[1]);for(const [give,amount] of stock){if(amount<game.tradeRate(room,p,give)+1)continue;
 for(const want of ['steel','timber','grain','coal'])if(want!==give&&p.resources[want]<2)L.push({type:'trade',kind:'bank',give,want,rank:14-p.resources[want]});}
 L.push({type:'skip',rank:-1});
 if(mode==='random')return L.sort(()=>rng()-.5);
 return L.map(x=>({...x,rank:x.rank+rng()*.3})).sort((a,b)=>b.rank-a.rank);
}
function plan(room,p,rng,mode){for(let slot=0;slot<p.actions.length;slot++){
 let ok=false;for(const a of candidates(room,p,rng,mode)){
  const {rank,...action}=a;try{game.setAction(room,p,slot,action);ok=true;break;}catch{}
 }
 if(!ok)game.setAction(room,p,slot,{type:'skip'});
 }game.lockIn(room,p);}
function gameOnce(opts,rng,mapTemplate){const room=game.createRoom('SIMS');const n=opts.players;const avatars=shuffle([...AVATARS],rng);for(let i=0;i<n;i++){const p=game.addPlayer(room,'Bot '+(i+1));game.chooseAvatar(room,p,avatars[i].id);}game.startGame(room,opts.mode,mapTemplate?()=>structuredClone(mapTemplate):undefined);
 let ticks=0;while(room.status!=='finished'){
  if(++ticks>2000)throw Error('Simulation stalled status='+room.status+' round='+room.round);
  if(room.status==='tickets'){for(const p of [...room.players])if(p.ticketChoices.length)game.chooseTickets(room,p,selectedTickets(room,p));}
  else if(room.status==='placement'){const p=room.players.find(p=>p.id===room.placement[room.placementIndex]);game.placeDepot(room,p,bestPlacement(room,p,rng));}
  else if(room.status==='draft'){for(const p of [...room.players])if(!p.draftDone)game.chooseUpgrade(room,p,draft(room,p));}
  else if(room.status==='income')game.tick(room,room.deadline+1);
  else if(room.status==='plan'){for(const p of [...room.players])if(!p.locked)plan(room,p,rng,opts.bots==='mixed'?(p.seat%2?'random':'greedy'):opts.bots);}
  else if(room.status==='market'){game.tick(room,room.deadline+1);}
  else if(room.status==='reveal'){game.tick(room,room.deadline+1);}
  else throw Error('Unknown phase '+room.status);
 }
 const order=[...room.players].sort((a,b)=>b.prestige-a.prestige||b.resources.gold-a.resources.gold||room.routes.filter(r=>r.owner===b.id).length-room.routes.filter(r=>r.owner===a.id).length);
 const top=order[0],winningSeats=(room.sharedWinners||[room.lastWinner]).filter(Boolean).map(id=>room.players.findIndex(p=>p.id===id)).filter(i=>i>=0);
 const completed=top.breakdown.completed?.length||0;
 return {rounds:room.round,prestige:top.prestige,early:room.round<room.settings.rounds,tie:order[0].prestige===order[1].prestige,winningSeats,breakdown:top.breakdown,routes:room.routes.filter(r=>r.owner).length,completed,winningResources:{...top.resources},unspent:room.players.reduce((acc,p)=>acc+Object.values(p.resources).reduce((a,b)=>a+b,0),0)/n};
}
function optsTarget(mode){return MODE[mode].target;}
function summarise(opts,results){const n=results.length,mean=xs=>xs.reduce((a,b)=>a+b,0)/xs.length,sorted=[...results].map(x=>x.prestige).sort((a,b)=>a-b);
 const means=key=>mean(results.map(x=>x[key]));const scoreKeys=['depot','city','rail','tickets','army','longest','grand','bonus','dividend'];const avg=Object.fromEntries(scoreKeys.map(k=>[k,+(mean(results.map(x=>x.breakdown[k]||0))).toFixed(2)]));
 return {metadata:{...opts,target:opts.target||optsTarget(opts.mode)},games:n,winnerPrestige:{mean:+means('prestige').toFixed(2),median:sorted[Math.floor(n/2)]},earlyTargetPct:+(results.filter(x=>x.early).length/n*100).toFixed(2),winnersAtLeast80Pct:+(results.filter(x=>x.prestige>=optsTarget(opts.mode)*.8).length/n*100).toFixed(2),firstPlacePrestigeTiePct:+(results.filter(x=>x.tie).length/n*100).toFixed(2),winPctBySeat:Array.from({length:opts.players},(_,i)=>+(results.reduce((sum,x)=>sum+(x.winningSeats.includes(i)?1/x.winningSeats.length:0),0)/n*100).toFixed(2)),winnerSources:avg,meanWinnerResources:Object.fromEntries(['coal','timber','grain','steel','gold'].map(k=>[k,+(mean(results.map(x=>x.winningResources[k]||0))).toFixed(2)])),meanRoutesClaimed:+means('routes').toFixed(2),meanWinnerTicketsCompleted:+means('completed').toFixed(2),meanUnspentResources:+means('unspent').toFixed(2),estimatedDurationMinutes:+(mean(results.map(x=>x.rounds))*((MODE[opts.mode].plan+5.5)/60)).toFixed(2)};
}
function run(opts){const original=Math.random;const oldTarget=MODE[opts.mode].target;const rng=seedRandom(opts.seed);Math.random=rng;
 if(opts.target!==null&&opts.target!==undefined)MODE[opts.mode].target=opts.target;
 try{const list=[];const maps=Array.from({length:Math.min(opts.games,opts.maps||128)},()=>generateMap(rng));for(let i=0;i<opts.games;i++)list.push(gameOnce(opts,rng,maps[i%maps.length]));return summarise(opts,list);}finally{Math.random=original;MODE[opts.mode].target=oldTarget;}}
function display(r){console.log(`IRON CROWN — ${r.metadata.mode} / ${r.metadata.players} players / ${r.metadata.bots} / seed ${r.metadata.seed} / ${r.metadata.maps} map templates / target ${r.metadata.target}`);console.table({Games:r.games,'Winner mean Prestige':r.winnerPrestige.mean,'Winner median Prestige':r.winnerPrestige.median,'Early target %':r.earlyTargetPct,'Winners reach >= 80% target %':r.winnersAtLeast80Pct,'First-place Prestige ties %':r.firstPlacePrestigeTiePct,'Routes claimed':r.meanRoutesClaimed,'Winning tickets completed':r.meanWinnerTicketsCompleted,'Unspent resources (per bot)':r.meanUnspentResources,'Estimated timer duration (min)':r.estimatedDurationMinutes});console.log('Win % by seat:',r.winPctBySeat.join(' / '));console.log('Winner Prestige sources:',r.winnerSources);console.log('Winner reserve resources:',r.meanWinnerResources);}
if(require.main===module){try{const opts=args(process.argv.slice(2)),summary=run(opts);display(summary);if(process.env.SIM_JSON)require('node:fs').writeFileSync(process.env.SIM_JSON,JSON.stringify(summary,null,2)+'\n');}catch(e){console.error(e.stack);process.exitCode=1;}}
module.exports={run,seedRandom,gameOnce,args};
