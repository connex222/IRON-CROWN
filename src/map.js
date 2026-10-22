'use strict';
const {DISTRIBUTION,NAMES}=require('./constants');
const DIRS=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];
const key=(q,r)=>`${q},${r}`;
const distance=(a,b)=>Math.max(Math.abs(a.q-b.q),Math.abs(a.r-b.r),Math.abs(a.q+a.r-b.q-b.r));
function neighbours(tile,map){return DIRS.map(([dq,dr])=>map.get(key(tile.q+dq,tile.r+dr))).filter(Boolean);}
function shuffle(arr,rng=Math.random){for(let i=arr.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;}
function pathfind(start,end,lookup,banShort=false){
 const queue=[[start.id]]; const seen=new Set([start.id]);
 while(queue.length){const p=queue.shift();const cur=lookup.get(p[p.length-1]);
   if(cur.id===end.id && (!banShort||p.length>=3)) return p;
   if(p.length>=6)continue;
   for(const next of shuffle(neighbours(cur,new Map([...lookup.values()].map(t=>[key(t.q,t.r),t]))).filter(x=>x.type!=='lake'))){
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
     let p=pathfind(nodes[i],nodes[j],byId);
     if(p?.length===2)p=pathfind(nodes[i],nodes[j],byId,true);
     if(p&&p.length>=3&&p.length<=6)possible.push({a:nodes[i].id,b:nodes[j].id,path:p,segments:p.length-1});
   }
   if(!best || possible.length>best.possible.length)best={tiles,possible};
   if(possible.length>=18)break;
 }
 if(!best||best.possible.length<18)throw Error('Could not generate 18 valid routes; retry map generation');
 const popularity=new Map();
 const routes=shuffle(best.possible,rng).sort((a,b)=>a.segments-b.segments).slice(0,18).map((r,i)=>({id:`R${i+1}`, ...r,owner:null,blocked:false}));
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
 let longest=0; const found=new Set();
 for(const route of owned){if(found.has(route.id))continue;
  let segmentCount=0, pending=[route];found.add(route.id);
  while(pending.length){const next=pending.pop();segmentCount+=next.segments;
    for(const other of owned){if(found.has(other.id))continue;if(other.path.some(x=>next.path.includes(x))){found.add(other.id);pending.push(other);}}
  }
  longest=Math.max(longest,segmentCount);
 }
 return longest;
}
module.exports={generateMap,neighbours,distance,shuffle,ownsConnection,longestRail,key};
