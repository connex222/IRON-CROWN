'use strict';
const TYPES = ['coal','forest','farm','steel','town','hill','lake'];
const DISTRIBUTION = {coal:6,forest:6,farm:6,steel:5,town:6,hill:4,lake:3};
const RESOURCES = ['coal','timber','grain','steel','gold'];
const TILES = {coal:'Coalfield',forest:'Forest',farm:'Farmland',steel:'Steelworks',town:'Market Town',hill:'Hills',lake:'Lake',capital:'The Capital'};
const AVATARS = [
 {id:'augusta',name:'Lady Augusta Blackwood',title:'The Duchess',colour:'#B3261E',perk:'Cities cost 1 less Grain'},
 {id:'silas',name:'Silas Brunel-Crane',title:'The Engineer',colour:'#1F4FA8',perk:'Track costs 1 less Steel per route'},
 {id:'jack',name:'“Lucky” Jack Hartigan',title:'The Gambler',colour:'#1E7A46',perk:'Reroll your die once per clash'},
 {id:'ada',name:'Mrs Ada Pennyworth',title:'The Banker',colour:'#C99A2E',perk:'2:1 bank trades for one resource each era'},
 {id:'rupert',name:'Colonel Rupert Fairfax',title:'The Colonel',colour:'#22305A',perk:'Recruit costs 1 Gold per soldier'},
 {id:'nell',name:'Nell Thackery',title:'The Union Boss',colour:'#C2571A',perk:'Immune to Coal Strike and Harsh Winter'},
 {id:'ottoline',name:'Professor Ottoline Vex',title:'The Inventor',colour:'#6B3FA0',perk:'Research 1 Gold less; extra draft choice'},
 {id:'ezra',name:'Mr Ezra Coldwell',title:'The Smuggler',colour:'#167B7B',perk:'One favourable 2-for-1 trade per round is compulsory'}
];
const UPGRADES={
 steam:[{id:'navvies',name:'Navvy Gangs',detail:'Every railway costs 1 less Timber (minimum 1).'}, {id:'corn',name:'Corn Exchange',detail:'Exchange Grain with the bank at 2:1.'},{id:'militia',name:'Militia',detail:'Receive 2 Soldiers now and 1 free each new era.'}],
 iron:[{id:'bessemer',name:'Bessemer Process',detail:'Upgrading a City costs 1 less Steel.'},{id:'express',name:'Express Lines',detail:'Your routes pay 2 Gold rather than 1.'},{id:'fort',name:'Fortifications',detail:'All your tiles gain +1 defence.'}],
 electric:[{id:'telegraph',name:'Telegraph',detail:'Change an unresolved action once during each Reveal.'},{id:'station',name:'Grand Station',detail:'Your first City becomes a Grand Station worth +2 Prestige.'},{id:'directors',name:'Board of Directors',detail:'Each completed ticket awards +1 extra Prestige.'}]
};
const EVENTS=[
 {id:'boom',name:'BOOM TIMES',detail:'All income is doubled this round.'},
 {id:'strike',name:'COAL STRIKE',detail:'Coalfields produce nothing.'},
 {id:'winter',name:'HARSH WINTER',detail:'Farmland produces nothing.'},
 {id:'rush',name:'GOLD RUSH',detail:'Hills produce 1 Gold.'},
 {id:'royal',name:'ROYAL VISIT',detail:'Owner of the most Cities earns +1 Prestige.'},
 {id:'collapse',name:'BRIDGE COLLAPSE',detail:'One random route pays nothing.'},
 {id:'mania',name:'RAILWAY MANIA',detail:'Track costs half (rounded up).'},
 {id:'recruit',name:'RECRUITMENT DRIVE',detail:'Soldiers cost 1 Gold each.'},
 {id:'flood',name:'FLOOD',detail:'Tiles neighbouring a Lake produce nothing.'},
 {id:'fair',name:'INVENTOR’S FAIR',detail:'Research costs 1 Gold less.'},
 {id:'peace',name:'PEACE TREATY',detail:'No attacking this round.'},
 {id:'crash',name:'MARKET CRASH',detail:'Bank trades are 4:1.'}
];
const NAMES=['Ashby','Port Ellery','Brasshaven','Oldwick','Marshfield','Riverton'];
const MODE={quick:{rounds:8,target:10,eras:[3,3,2],plan:60},standard:{rounds:12,target:15,eras:[4,4,4],plan:90},advanced:{rounds:12,target:15,eras:[4,4,4],plan:90}};
module.exports={TYPES,DISTRIBUTION,RESOURCES,TILES,AVATARS,UPGRADES,EVENTS,NAMES,MODE};
