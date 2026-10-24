'use strict';
const {DISTRIBUTION,NAMES}=require('./constants');
const DIRS=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];
const key=(q,r)=>`${q},${r}`;
const distance=(a,b)=>Math.max(Math.abs(a.q-b.q),Math.abs(a.r-b.r),Math.abs(a.q+a.r-b.q-b.r));
function neighbours(tile,map){return DIRS.map(([dq,dr])=>map.get(key(tile.q+dq,tile.r+dr))).filter(Boolean);}
function shuffle(arr,rng=Math.random){for(let i=arr.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;}
function pathfind(start,end,lookup,banShort=false,rng=Math.random){
 const queue=[[start.id]]; const seen=new Set([start.id]);
 while(queue.length){const p=queue.shift();const cur=lookup.get(p[p.length-1]);
   if(cur.id===end.id && (!banShort||p.length>=3)) return p;
   if(p.length>=6)continue;
   for(const next of shuffle(neighbours(cur,new Map([...lookup.values()].map(t=>[key(t.q,t.r),t]))).filter(x=>x.type!=='lake'),rng)){
    if(p.includes(next.id))continue;
    if(banShort && cur.id===start.id && next.id===end.id)continue;
    if(next.id!==end.id && seen.has(next.id))continue;
    if(next.id!==end.id)seen.add(next.id);
    queue.push([...p,next.id]);
   }
 }
 return null;
}
function generateMap(rng=Math.random){
 const coords=[];for(let q=-3;q<=3;q++)for(let r=-3;r<=3;r++)if(Math.max(Math.abs(q),Math.abs(r),Math.abs(q+r))<=3 && (q!==0||r!==0))coords.push({q,r});
 const types=Object.entries(DISTRIBUTION).flatMap(([type,count])=>Array(count).fill(type));
 let best=null;
 for(let tries=0;tries<1000;tries++){
   shuffle(types,rng); const tiles=[{id:'0,0',q:0,r:0,type:'capital',owner:null,soldiers:0,city:false,grand:false}];
   coords.forEach((c,i)=>tiles.push({id:key(c.q,c.r),...c,type:types[i],owner:null,soldiers:0,city:false,grand:false}));
   const byCoord=new Map(tiles.map(t=>[t.id,t]));
   if(tiles.some(t=>t.type==='lake'&&neighbours(t,byCoord).some(n=>n.type==='lake')))continue;
   const towns=tiles.filter(t=>t.type==='town').sort((a,b)=>a.q-b.q||a.r-b.r); towns.forEach((t,i)=>t.name=NAMES[i]);
   tiles[0].name='The Capital';
   const nodes=[tiles[0],...towns], byId=new Map(tiles.map(t=>[t.id,t]));
   const possible=[];
   for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
     let p=pathfind(nodes[i],nodes[j],byId,false,rng);
     if(p?.length===2)p=pathfind(nodes[i],nodes[j],byId,true,rng);
     if(p&&p.length>=3&&p.length<=6)possible.push({a:nodes[i].id,b:nodes[j].id,path:p,segments:p.length-1});
   }
   if(!best || possible.length>best.possible.length)best={tiles,possible};
   if(possible.length>=18)break;
 }
 if(!best||best.possible.length<18)throw Error('Could not generate 18 valid routes; retry map generation');
 // Balance coverage of town stations and the Capital. When possible prefer
 // different-length journeys instead of always selecting the 18 shortest.
 const pool=shuffle([...best.possible],rng),degrees=new Map(),usedTracks=new Map(),selected=[];
 while(selected.length<18){
   let bestIndex=0,bestScore=-Infinity;
   for(let i=0;i<pool.length;i++){
     const r=pool[i],da=degrees.get(r.a)||0,db=degrees.get(r.b)||0;
     const scarce=n=>n===0?7:n===1?3:n===2?1:0;
     const overlaps=r.path.slice(1).reduce((n,id,k)=>n+(usedTracks.get([r.path[k],id].sort().join('|'))||0),0);
     const score=scarce(da)+scarce(db)+(r.segments>=4?1.8:0)-overlaps*.18+rng()*.35;
     if(score>bestScore){bestScore=score;bestIndex=i;}
   }
   const [r]=pool.splice(bestIndex,1);selected.push(r);
   degrees.set(r.a,(degrees.get(r.a)||0)+1);degrees.set(r.b,(degrees.get(r.b)||0)+1);
   for(let i=1;i<r.path.length;i++){const k=[r.path[i-1],r.path[i]].sort().join('|');usedTracks.set(k,(usedTracks.get(k)||0)+1);}
 }
 const routes=selected.map((r,i)=>({id:`R${i+1}`,...r,era:'steam',owner:null,blocked:false}));
 // These six EXTRA charters preserve the original 18 routes and ticket deck.
 // Three viaducts cross one of the lake hexes, and three electric links
 // terminate at the Capital. All endpoint pairs are distinct.
 const selectedPairs=new Set(routes.map(r=>[r.a,r.b].sort().join('|')));
 const usedBridgeEnds=new Set();
 const bridges=[];
 const byCoord=new Map(best.tiles.map(t=>[t.id,t]));
 const lakes=best.tiles.filter(t=>t.type==='lake');
 for(const lake of lakes){
   const adjacency=neighbours(lake,byCoord).filter(t=>t.type!=='lake');
   let pick=null,bestRank=-Infinity;
   for(let i=0;i<adjacency.length;i++)for(let j=i+1;j<adjacency.length;j++){
     const left=adjacency[i],right=adjacency[j];
     // A viaduct may also have a one-hex approach ramp at either bank.
     // This resolves rare maps where both immediate shore endpoints are
     // an already-chartered town pair, without duplicating an endpoint pair.
     const leftEnds=[null,...neighbours(left,byCoord).filter(t=>t.type!=='lake'&&t.id!==right.id&&t.id!==lake.id)];
     const rightEnds=[null,...neighbours(right,byCoord).filter(t=>t.type!=='lake'&&t.id!==left.id&&t.id!==lake.id)];
     for(const l of leftEnds)for(const rr of rightEnds){
       const path=[...(l?[l.id]:[]),left.id,lake.id,right.id,...(rr?[rr.id]:[])];
       if(new Set(path).size!==path.length)continue;
       const a=byCoord.get(path[0]),b=byCoord.get(path.at(-1));
       const pair=[a.id,b.id].sort().join('|');
       if(selectedPairs.has(pair))continue;
       const edgeScore=t=>routes.filter(r=>r.path.includes(t.id)).length;
       const rank=edgeScore(a)+edgeScore(b)+(a.type==='town'?4:0)+(b.type==='town'?4:0)
        -(usedBridgeEnds.has(a.id)?4:0)-(usedBridgeEnds.has(b.id)?4:0)
        +Math.min(path.length-3,2)*.7+rng()*.01;
       if(rank>bestRank){bestRank=rank;pick={a:a.id,b:b.id,path,segments:path.length-1};}
     }
   }
   if(!pick)throw Error('Lake lacks a viable unique bridge charter');
   selectedPairs.add([pick.a,pick.b].sort().join('|'));
   usedBridgeEnds.add(pick.a);usedBridgeEnds.add(pick.b);
   bridges.push({id:`B${bridges.length+1}`,...pick,era:'iron',owner:null,blocked:false});
 }
 if(bridges.length!==3)throw Error('Expected three lake-crossing bridges');
 const capital=best.tiles.find(t=>t.type==='capital');
 const electric=[];
 const electricCandidates=shuffle(best.tiles.filter(t=>['coal','forest','farm','steel','town'].includes(t.type)
   &&distance(capital,t)>=2),rng).map(t=>{
     const path=pathfind(capital,t,new Map(best.tiles.map(n=>[n.id,n])),false,rng);
     if(!path||path.length<3)return null;
     // Prefer longer high-value links with fewer sections already in base routes.
     const used=new Set(routes.flatMap(r=>r.path.slice(1).map((id,i)=>[r.path[i],id].sort().join('|'))));
     const overlap=path.slice(1).filter((id,i)=>used.has([path[i],id].sort().join('|'))).length;
     return {a:capital.id,b:t.id,path,segments:path.length-1,rank:(path.length-1)*5-overlap*6+(t.type==='town'?4:0)+rng()*.01};
   }).filter(Boolean).sort((a,b)=>b.rank-a.rank);
 for(const candidate of electricCandidates){
   const pair=[candidate.a,candidate.b].sort().join('|');
   if(selectedPairs.has(pair))continue;
   selectedPairs.add(pair);
   const {rank,...details}=candidate;
   electric.push({id:`E${electric.length+1}`,...details,era:'electric',owner:null,blocked:false});
   if(electric.length===3)break;
 }
 if(electric.length!==3)throw Error('Could not create three unique Capital express charters');
 routes.push(...bridges,...electric);
 // A ticket deck has 24 physical cards; some town pairs intentionally occur twice.
 const nodes=best.tiles.filter(t=>t.type==='town'||t.type==='capital');
 const pairs=[];
 for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++)pairs.push({a:nodes[i].id,b:nodes[j].id});
 shuffle(pairs,rng);const deck=[...pairs,...pairs.slice(0,3)].map((pair,i)=>({id:`T${i+1}`,a:pair.a,b:pair.b,value:Math.min(4,Math.max(2,Math.ceil(distance(nodes.find(n=>n.id===pair.a),nodes.find(n=>n.id===pair.b))/2)+1))}));
 return {tiles:best.tiles,routes,deck:shuffle(deck,rng)};
}
function ownsConnection(tiles,routes,playerId,a,b){
 const own=routes.filter(r=>r.owner===playerId);
 const graph=new Map();
 for(const r of own){for(let i=1;i<r.path.length;i++){
 const u=r.path[i-1],v=r.path[i];if(!graph.has(u))graph.set(u,new Set());if(!graph.has(v))graph.set(v,new Set());graph.get(u).add(v);graph.get(v).add(u);
 }}
 const seen=new Set([a]),q=[a];while(q.length){const x=q.shift();if(x===b)return true;for(const n of graph.get(x)||[])if(!seen.has(n)){seen.add(n);q.push(n);}}
 return false;
}
function longestRail(owned){
 // Connected railway groups count physical track segments only once, even
 // where separately claimed routes share the same hex-to-hex track section.
 let longest=0;const found=new Set();
 for(const route of owned){if(found.has(route.id))continue;
  const edges=new Set(),pending=[route];found.add(route.id);
  while(pending.length){const next=pending.pop();
   for(let i=1;i<next.path.length;i++)edges.add([next.path[i-1],next.path[i]].sort().join('|'));
   for(const other of owned){if(found.has(other.id))continue;
    if(other.path.some(x=>next.path.includes(x))){found.add(other.id);pending.push(other);}
   }
  }
  longest=Math.max(longest,edges.size);
 }
 return longest;
}
module.exports={generateMap,neighbours,distance,shuffle,ownsConnection,longestRail,key};
