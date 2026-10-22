from pathlib import Path
ROOT=Path('/mnt/data/iron-crown/public')
tv=ROOT/'tv.html'; phone=ROOT/'phone.html'

def swap(txt,old,new,tag):
 if old not in txt:raise RuntimeError('Cannot find '+tag)
 return txt.replace(old,new,1)

s=tv.read_text()
old='<header class="bar"><div class="brandline"><img src="/art/iron-crown-crest.svg" class="crest" alt="Iron Crown crest"><h1>IRON CROWN</h1></div>'
new='<header class="bar"><div class="brandline"><img src="/art/iron-crown-premium.png" class="nav-logo" alt="Iron Crown"></div>'
s=swap(s,old,new,'tv header')
start=s.index('<section class="hero" id="lobby">');end=s.index('</section>',start)+len('</section>')
# The old lobby is a standalone section, so remove only that section.
replacement='''<section class="hero-premium" id="lobby" aria-label="Iron Crown railway parlour">
  <div class="hero-haze" aria-hidden="true"></div>
  <div class="hero-grid">
    <div class="hero-story">
      <div class="hero-topline">EST. 1830 · A COUNTRY TO CONQUER</div>
      <img class="hero-logo" src="/art/iron-crown-premium.png" alt="IRON CROWN — The railway empire game">
      <div class="hero-tagline">BUILD THE LINES. CLAIM THE CROWN.</div>
      <p class="hero-intro">The old king is gone. Eight rival tycoons will build the railways, forge their fortunes and decide who inherits his kingdom.</p>
      <div class="hero-chips"><span>2–8 TYCOONS</span><span>3 INDUSTRIAL ERAS</span><span>30–60 MINUTES</span></div>
      <div class="hero-story-footer">STEAM <i>◆</i> IRON <i>◆</i> ELECTRIC</div>
    </div>
    <div class="join-premium panel">
      <div class="eyebrow">THE PRIVATE RAILWAY PARLOUR</div>
      <h2>Gather your tycoons</h2>
      <p class="join-subtitle">Every player joins on their own phone. Your railway empire unfolds on the television.</p>
      <div class="join-code-grid"><div><div class="eyebrow">ROOM CODE</div><div class="room-code" id="roomCode">····</div><p class="minor">Open <strong id="joinURL">/phone.html</strong><br>and enter this code.</p></div><div class="qr-box"><canvas id="qr" width="220" height="220" aria-label="QR code to join on a phone"></canvas></div></div>
      <div class="join-controls"><label class="eyebrow" for="mode">GAME FORMAT</label><select id="mode" aria-label="Game mode"><option value="quick">Quick · 8 rounds</option><option value="standard" selected>Standard · 12 rounds</option><option value="advanced">Advanced · 12 rounds</option></select><button id="botBtn" class="btn alt">+ Add AI Tycoon</button></div>
      <div class="joined-heading"><span>PLAYERS IN THE PARLOUR</span><span>MAX 8</span></div>
      <div id="players" class="players-list"></div><p id="playerHint" class="minor">Waiting for two or more tycoons…</p>
      <button id="startBtn" class="btn enter-empire" disabled>BEGIN THE RAILWAY RACE →</button>
    </div>
  </div>
  <div class="tycoon-parade" aria-label="Eight characters to choose from"><div class="tycoon-parade-title">THE EIGHT RIVALS</div><div class="tycoon-faces">
     <div><img src="/art/avatars/augusta_steam_neutral.png" alt=""><span>THE DUCHESS</span></div><div><img src="/art/avatars/silas_steam_neutral.png" alt=""><span>THE ENGINEER</span></div><div><img src="/art/avatars/jack_steam_neutral.png" alt=""><span>THE GAMBLER</span></div><div><img src="/art/avatars/ada_steam_neutral.png" alt=""><span>THE BANKER</span></div><div><img src="/art/avatars/rupert_steam_neutral.png" alt=""><span>THE COLONEL</span></div><div><img src="/art/avatars/nell_steam_neutral.png" alt=""><span>THE UNION BOSS</span></div><div><img src="/art/avatars/ottoline_steam_neutral.png" alt=""><span>THE INVENTOR</span></div><div><img src="/art/avatars/ezra_steam_neutral.png" alt=""><span>THE SMUGGLER</span></div>
  </div></div>
</section>'''
s=s[:start]+replacement+s[end:]
# Add styling after Phase 2 CSS so selectors take precedence.
css='''
/* PHASE 3 — Premium main menu and human tycoon identities */
.nav-logo{width:202px;max-height:59px;object-fit:contain;display:block;filter:drop-shadow(0 2px 8px #c3933230)}
.hero-premium{min-height:calc(100vh - 78px);color:#f5e6c2;position:relative;overflow:hidden;background:#101a17;isolation:isolate}
.hero-premium:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,#0d1717 1%,#0e1e1cd9 35%,#0714114a 73%,#0b130fa6 100%),url('/art/victorian-terminal.jpg') center 30%/cover no-repeat;z-index:-2;filter:saturate(1.04)}
.hero-premium:after{content:"";pointer-events:none;position:absolute;inset:0;border:10px ridge #96733440;box-shadow:inset 0 0 110px #0e110fee;z-index:3}
.hero-haze{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 53% 20%,#ffe4a018,transparent 44%);z-index:-1}
.hero-grid{max-width:1540px;margin:auto;min-height:min(76vh,820px);display:grid;grid-template-columns:minmax(450px,1.06fr) minmax(370px,.78fr);align-items:center;gap:clamp(25px,3.8vw,75px);padding:clamp(28px,4.4vw,65px);position:relative;z-index:1}
.hero-story{max-width:765px}.hero-topline{color:#e8c879;letter-spacing:.35em;font-weight:700;font-size:12px;border-left:3px solid #d4b16a;padding-left:12px;margin-left:7px}
.hero-logo{width:min(100%,720px);height:auto;margin:17px 0 -4px;filter:drop-shadow(0 16px 20px #0009)}
.hero-tagline{font:700 clamp(16px,1.8vw,23px) Georgia,serif;letter-spacing:.13em;color:#f4d47a;margin:16px 0;text-shadow:0 2px 6px #0008}
.hero-intro{max-width:565px;font-size:clamp(17px,1.5vw,20px);line-height:1.65;color:#f4e6cd;text-shadow:0 2px 5px #050b09}
.hero-chips{display:flex;flex-wrap:wrap;gap:9px;margin:24px 0}.hero-chips span{background:#091917d9;border:1px solid #bc934c;padding:11px 14px;letter-spacing:.09em;font-size:11px;font-weight:800;border-radius:3px}
.hero-story-footer{font-family:Georgia,serif;font-size:16px;letter-spacing:.24em;color:#dec27e;margin-top:35px}.hero-story-footer i{font-style:normal;font-size:10px;margin:0 11px}
.join-premium{background:linear-gradient(160deg,#071a19f2,#101d1bf7 60%,#271c14f8);border:2px solid #b29052;border-radius:8px;box-shadow:0 20px 65px #000a,0 0 0 5px #080f0fbb,inset 0 0 0 2px #d4b26425;padding:clamp(20px,2.5vw,34px);color:#fff1d0}
.join-premium h2{font-size:clamp(28px,2.6vw,40px);color:#f5ddb1;margin:9px 0 5px}.join-subtitle{font-size:14px;line-height:1.55;color:#e4d6bb;margin:5px 0 18px}
.join-premium .eyebrow{color:#e8c779}.join-premium .minor{color:#e6dbc6;font-size:13px}.join-code-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(150px,185px);align-items:center;gap:16px;background:#d6b77713;border:1px solid #c3a4695a;padding:14px;border-radius:6px}
.join-code-grid .room-code{font-size:clamp(43px,4vw,70px);color:#f5cf69;letter-spacing:.08em;text-shadow:0 2px 8px #cfa64245}.join-code-grid .qr-box{min-width:0;min-height:0;width:100%;padding:7px;border-radius:5px}.join-code-grid canvas{width:100%;height:auto;image-rendering:pixelated}
.join-controls{display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin-top:17px}.join-controls .eyebrow{width:100%;margin-bottom:0}.join-controls select{flex:1;min-width:160px;min-height:53px;border:1px solid #c49b58;background:#1d2c28;color:#fff2ce;border-radius:5px;padding:10px;font-size:15px}.join-controls .btn{min-height:53px;border-radius:5px;font-size:14px}
.joined-heading{display:flex;justify-content:space-between;letter-spacing:.1em;font-size:11px;font-weight:800;color:#f1d78d;margin:18px 0 8px}.join-premium .players-list{margin:0;gap:8px;max-height:188px;overflow:auto}.join-premium .player-card{color:#fbeaca;background:#f3d99314;border:1px solid #a8874c;border-radius:5px}.join-premium .player-card .mini{color:#d9caa6}.join-premium .player-card button{color:#f7b98a}
.join-premium #playerHint{margin:10px 0}.enter-empire{width:100%;font-size:16px;min-height:59px;border-radius:6px}
.tycoon-parade{position:relative;z-index:1;background:linear-gradient(90deg,#101c1af5,#24251ff5 70%,#141c19f5);border-top:1px solid #d1aa60aa;padding:15px 30px 21px}.tycoon-parade-title{text-align:center;font:700 12px Georgia,serif;letter-spacing:.26em;color:#f1d48b;margin-bottom:12px}.tycoon-faces{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));max-width:1210px;margin:auto;gap:12px}.tycoon-faces>div{display:flex;gap:7px;align-items:center;flex-direction:column;min-width:0;text-align:center}.tycoon-faces img{width:65px;height:65px;object-fit:cover;border:2px solid #b58e54;border-radius:9px;box-shadow:0 7px 16px #0008}.tycoon-faces span{font-size:9px;font-weight:700;letter-spacing:.09em;color:#e4c995}
/* Human portraits should remain legible in the TV score rail and results. */
.roster{width:230px}.game-layout{grid-template-columns:230px minmax(0,1fr)}.roster .player-card{min-height:76px;border-left:4px solid #ab873a}.roster .portrait{width:58px!important;height:58px!important;border-radius:8px;object-fit:cover}.roster .tycoon-role{color:#e5c983;font-size:11px;line-height:1.4}.roster .player-card .name{font-size:13px}
.portrait{object-fit:cover;object-position:center 27%;border-radius:8px}.notice.actor-notice{max-width:min(700px,90vw)}.actor-notice .clash-actors{display:flex;justify-content:center;gap:10px;margin-bottom:10px}.clash-actors img{height:100px;width:100px;object-fit:cover;border:2px solid #cbaa69;border-radius:8px}.actor-notice .actor-label{font-size:11px;color:#efcd87;text-align:center;max-width:105px}
@media(max-width:1000px){.hero-grid{grid-template-columns:minmax(0,1fr);min-height:unset;gap:24px}.hero-story{text-align:center;margin:auto}.hero-topline{display:inline-block}.hero-intro{margin-inline:auto}.hero-chips{justify-content:center}.join-premium{width:min(100%,700px);margin:auto}.tycoon-faces img{width:51px;height:51px}.tycoon-faces span{font-size:8px}}
@media(max-width:650px){.hero-grid{padding:18px 15px 30px}.hero-logo{max-width:380px}.hero-chips{gap:5px}.hero-chips span{padding:6px;font-size:10px}.hero-story-footer{margin-top:15px}.join-code-grid{grid-template-columns:1fr 140px}.join-premium{padding:17px}.tycoon-faces{grid-template-columns:repeat(4,1fr);row-gap:14px}.nav-logo{width:150px}.bar{padding:9px 10px}.bar .pill{display:none}.tycoon-parade{padding:13px 12px}.hero-premium:before{background-position:60% center}}
@media(prefers-reduced-motion:reduce){.hero-premium *, .actor-notice *{animation:none!important}}
'''
s=swap(s,'</style></head><body>',css+'</style></head><body>','tv CSS')
# Avatar moods reflect server-supplied game events. Race declarations are visible,
# but no one can impersonate an opponent: source is authoritative feed.
s=swap(s,"const avatarFor=p=>`/art/avatars/${p?.avatar||'augusta'}_${publicState?.era||'steam'}_neutral.png`;",
"const avatarFor=(p,mood='neutral')=>`/art/avatars/${p?.avatar||'augusta'}_${publicState?.era||'steam'}_${mood}.png`;\nconst actorTitles={augusta:'THE DUCHESS',silas:'THE ENGINEER',jack:'THE GAMBLER',ada:'THE BANKER',rupert:'THE COLONEL',nell:'THE UNION BOSS',ottoline:'THE INVENTOR',ezra:'THE SMUGGLER'};",'tv avatars')
s=swap(s,'<div class="name">${escapeHTML(p.name)}</div><div class="stars">','<div class="name">${escapeHTML(p.name)}</div><div class="tycoon-role">${actorTitles[p.avatar]||\'TYCOON\'}</div><div class="stars">','tv roster')
old="function renderFx(s){const fx=s.feed.filter(x=>x.seq>seenSeq);for(const item of fx){if(['clash','city','track','win','era','income'].includes(item.kind))playFX(item.kind);if(item.kind==='clash')showNotice('⚔ THE CLASH',item.message,2600);if(item.kind==='win')showNotice('♛ THE CROWN',item.message,5000);if(item.kind==='era'&&s.status==='draft')showNotice(`${s.era.toUpperCase()} ERA`,'A new age begins. Choose an Upgrade!',2600);}}"
new="""function renderFx(s){const fx=s.feed.filter(x=>x.seq>seenSeq);for(const item of fx){if(['clash','city','track','win','era','income'].includes(item.kind))playFX(item.kind);if(item.kind==='clash')showActorNotice('⚔ THE CLASH',item,2700);if(item.kind==='win')showActorNotice('♛ THE CROWN',item,5000);if(item.kind==='era'&&s.status==='draft')showNotice(`${s.era.toUpperCase()} ERA`,'A new age begins. Choose an Upgrade!',2600);}}
function showActorNotice(heading,item,ms){const ids=item.kind==='clash'&&Array.isArray(item.results)?item.results.map(r=>r.id):[item.player];const actors=ids.map(id=>publicState.players.find(p=>p.id===id)).filter(Boolean).slice(0,4);clearTimeout(noticeTimer);$('notice').classList.add('actor-notice');$('notice').innerHTML=`<div class="eyebrow">THE DAILY GAZETTE</div><h2>${escapeHTML(heading)}</h2><div class="clash-actors">${actors.map(p=>`<div><img src="${avatarFor(p,p.id===item.player?'smug':'furious')}" alt="${escapeHTML(p.name)}"><div class="actor-label">${escapeHTML(p.name)}</div></div>`).join('')}</div><p>${escapeHTML(item.message)}</p>`;$('notice').classList.remove('hidden');noticeTimer=setTimeout(()=>{$('notice').classList.add('hidden');$('notice').classList.remove('actor-notice');},ms);}
"""
s=swap(s,old,new,'tv feed')
s=swap(s,"function showNotice(heading,message,ms=3000){clearTimeout(noticeTimer);","function showNotice(heading,message,ms=3000){clearTimeout(noticeTimer);$('notice').classList.remove('actor-notice');",'notice reset')
tv.write_text(s)

p=phone.read_text()
p=swap(p,'<header><div><div><img src="/art/iron-crown-crest.svg" alt="" style="width:37px;height:37px;vertical-align:middle"> <span class="brand">IRON CROWN</span></div>',
'<header><div><div><img src="/art/iron-crown-premium.png" class="phone-logo" alt="Iron Crown"></div>','phone header')
p=swap(p,"const resourceIcons={coal:","const bios={augusta:['A noble eye for power','Cities cost 1 less Grain'],silas:['The genius behind the rails','Track costs 1 less Steel per route'],jack:['Fortune favours the daring','Reroll your die once per clash'],ada:['Every empire needs a ledger','Bank trades 2:1 for a chosen resource'],rupert:['Discipline conquers all','Recruit costs 1 Gold per Soldier'],nell:['The people move the country','Immune to Coal Strike and Harsh Winter'],ottoline:['Tomorrow belongs to invention','Research costs 1 less Gold; extra draft choice'],ezra:['Every border has a price','One favourable 2:1 trade per round is compulsory']};\nconst resourceIcons={coal:",'phone bios')
old='''function renderAvatar(){const taken=new Set(publicS.players.filter(x=>x.id!==pid).map(x=>x.avatar));
 $('app').innerHTML=`<section class="card gold"><div class="eyebrow">Step one of your empire</div><h1>Choose your tycoon</h1><p class="caption">Eight formidable personalities. In Advanced mode, each has a unique advantage.</p><div class="grid2">${people.map(([id,name,title,colour])=>`<button class="avatar-choice" data-avatar="${id}" ${taken.has(id)?'disabled':''}><img src="${avatar(id)}" alt="${esc(name)}" onerror="this.style.background='${colour}'"><span>${esc(name)}</span><br><small>${title}</small>${taken.has(id)?'<br><small>TAKEN</small>':''}</button>`).join('')}</div></section>`;
 $('app').querySelectorAll('[data-avatar]').forEach(b=>b.onclick=()=>send('avatar',{avatar:b.dataset.avatar}));
}'''
new='''function renderAvatar(){const taken=new Set(publicS.players.filter(x=>x.id!==pid).map(x=>x.avatar));
 $('app').innerHTML=`<section class="tycoon-intro"><div class="eyebrow">THE TYCOONS OF IRON CROWN</div><h1>Choose your rival.</h1><p>Eight extraordinary people. One railway empire. Each character has a signature strategy in Advanced mode.</p></section><section class="avatar-gallery grid2">${people.map(([id,name,title,colour])=>`<button class="avatar-choice" data-avatar="${id}" ${taken.has(id)?'disabled':''} style="--actor:${colour}"><img src="${avatar(id)}" alt="Portrait of ${esc(name)}"><span class="actor-title">${esc(title)}</span><span class="actor-name">${esc(name)}</span><span class="actor-quote">“${esc(bios[id][0])}”</span><span class="actor-perk">${esc(bios[id][1])}</span>${taken.has(id)?'<span class="actor-taken">TAKEN</span>':'<span class="actor-choose">CHOOSE TYCOON →</span>'}</button>`).join('')}</section>`;
 $('app').querySelectorAll('[data-avatar]').forEach(b=>b.onclick=()=>send('avatar',{avatar:b.dataset.avatar}));
}'''
p=swap(p,old,new,'phone avatar grid')
old=''' $('app').innerHTML=`<section class="card gold" style="text-align:center"><div class="eyebrow">Room ${publicS.code}</div><h1>The Railway Parlour</h1><img class="big-avatar" src="${avatar(me.avatar)}" alt="Your tycoon"><h2>${esc(a?.[1]||me.name)}</h2><div class="caption">${esc(a?.[2]||'Tycoon')}</div><p>The host will begin the game when everyone has joined. Keep this phone handy.</p><div class="hint">Your phone controls your secret plans. The TV displays the shared country and all the dramatic reveals.</div></section><section class="card"><h3>Tycoons gathered · ${publicS.players.length}/8</h3>${publicS.players.map(pl=>`<div class="sheet-row"><span>${esc(pl.name)} ${pl.id===pid?'(you)':''}</span><span>${pl.avatar?'✔':'Choosing…'}</span></div>`).join('')}</section>`;'''
new=''' $('app').innerHTML=`<section class="card player-showcase" style="--actor:${a?.[3]||'#b18b47'}"><div class="eyebrow">YOUR TYCOON · ROOM ${esc(publicS.code)}</div><img class="hero-actor" src="${avatar(me.avatar)}" alt="Your tycoon, ${esc(a?.[1]||me.name)}"><h1>${esc(a?.[1]||me.name)}</h1><div class="actor-role">${esc(a?.[2]||'Tycoon')}</div><p>“${esc(bios[me.avatar]?.[0]||'The railway awaits.') }”</p><div class="perk-box"><b>ADVANCED MODE ADVANTAGE</b><span>${esc(bios[me.avatar]?.[1]||'')}</span></div><p>The host starts the railway race. Keep your private plans on this phone.</p></section><section class="card"><h3>Tycoons gathered · ${publicS.players.length}/8</h3>${publicS.players.map(pl=>`<div class="sheet-row gathering"><img src="${avatar(pl.avatar||'augusta')}" alt=""><span>${esc(pl.name)} ${pl.id===pid?'(you)':''}</span><span class="right">${pl.avatar?'✔ Ready':'Choosing…'}</span></div>`).join('')}</section>`;'''
p=swap(p,old,new,'phone lobby profile')
old="$('app').innerHTML=`<section class=\"card gold animated\">${h('Enter the railway parlour','The Crown awaits')}<p class=\"caption\">Open Iron Crown on the TV, scan its QR code or enter its room code.</p>"
new="$('app').innerHTML=`<section class=\"phone-join-scene\"><img src=\"/art/iron-crown-premium.png\" alt=\"Iron Crown\"><div class=\"eyebrow\">PRIVATE RAILWAY CONTROLLER</div><p>BUILD THE LINES. CLAIM THE CROWN.</p></section><section class=\"card gold animated join-form\">${h('Join the Empire','The Crown awaits')}<p class=\"caption\">Scan the code on the TV or enter the room code to join the game.</p>"
p=swap(p,old,new,'phone join screen')
phonecss='''
/* PHASE 3 — Premium private controller and cinematic human characters */
.phone-logo{width:163px;max-height:52px;object-fit:contain;display:block}header{background:linear-gradient(120deg,#091918,#251c17);box-shadow:0 5px 20px #0004}.status{letter-spacing:.13em;font-size:11px}
body{background-image:radial-gradient(circle at 70% -5%,#d1aa4830,transparent 35%)}
.phone-join-scene{text-align:center;background:linear-gradient(#0c211fe0,#11211bef),url('/art/victorian-terminal.jpg') center/cover;padding:34px 22px 28px;border:2px solid #b58e45;border-radius:11px;margin-bottom:16px;box-shadow:0 10px 32px #0005;color:#f3dfb4}
.phone-join-scene img{width:min(100%,410px);max-height:180px;object-fit:contain;filter:drop-shadow(0 8px 9px #000a)}.phone-join-scene .eyebrow{color:#e6c46d}.phone-join-scene p{letter-spacing:.15em;font-size:12px;font-weight:800}.join-form{border:2px solid #b78e3a;box-shadow:0 8px 24px #0002}
.tycoon-intro{text-align:center;background:linear-gradient(150deg,#111d19,#33251a);color:#f4e7ce;border:1px solid #b99a55;border-radius:11px;padding:25px 16px;margin-bottom:15px}
.tycoon-intro h1{font-size:36px;color:#f5d98b}.tycoon-intro .eyebrow{color:#e7c56e}.tycoon-intro p{line-height:1.55;color:#ecdbb9;margin-bottom:0}
.avatar-gallery{gap:13px}.avatar-choice{position:relative;display:flex;align-items:center;flex-direction:column;overflow:hidden;border-radius:11px;border:2px solid var(--actor);padding:0 0 12px;background:linear-gradient(150deg,#25332f,#131e20);color:#fff0ce;box-shadow:0 9px 20px #0004;min-height:335px;text-align:center;transition:transform .2s,border-color .2s}.avatar-choice:focus-visible{outline:4px solid #f7dc91;outline-offset:3px}.avatar-choice:hover:not(:disabled){transform:translateY(-3px);border-color:#f4cc73}.avatar-choice img{width:100%;height:auto;aspect-ratio:1/1;object-fit:cover;border:0;border-bottom:3px solid var(--actor);border-radius:0;margin:0 0 9px}.actor-title{font-size:10px;letter-spacing:.12em;font-weight:800;color:#efc96d;text-transform:uppercase}.actor-name{font:700 17px/1.14 Georgia,serif;padding:4px 8px;min-height:42px}.actor-quote{font:italic 12px Georgia,serif;color:#e7d9bc;padding:0 7px;min-height:29px}.actor-perk{font-size:11px;line-height:1.3;opacity:.92;padding:5px 9px;min-height:38px}.actor-choose{font-size:11px;letter-spacing:.06em;font-weight:900;color:#ffe6a0;padding-top:8px;border-top:1px solid #cca45455;width:90%}.actor-taken{position:absolute;top:8px;right:6px;padding:5px 7px;background:#371713;color:#fff6dd;border:1px solid #e6b86b;font-size:11px;transform:rotate(4deg)}.avatar-choice:disabled{opacity:.44;filter:grayscale(.4)}
.player-showcase{text-align:center;background:radial-gradient(circle at center 27%,#555244,#1b2b29 60%,#151c1b);border:2px solid var(--actor);color:#f7e6c7}.player-showcase .eyebrow{color:#f4ca70}.player-showcase .hero-actor{display:block;width:min(100%,278px);aspect-ratio:1/1;object-fit:cover;margin:7px auto 18px;border:3px solid #d6ad57;border-radius:12px;box-shadow:0 12px 26px #0008}.player-showcase h1{color:#ffe0a2;margin-bottom:5px}.player-showcase p{line-height:1.5}.actor-role{font-size:14px;letter-spacing:.17em;color:#f0cd77;text-transform:uppercase}.perk-box{text-align:left;display:grid;gap:5px;margin:20px 0;padding:13px;background:#d6b15b17;border:1px solid #ad8b53;border-radius:8px}.perk-box b{font-size:11px;letter-spacing:.09em;color:#edcf85}.perk-box span{font-size:14px}.gathering img{width:40px;height:40px;object-fit:cover;border-radius:6px;border:1px solid #b38e45}.gathering span:nth-child(2){font-weight:700}
/* Preserve full-size 16px interface text while keeping character metadata compact. */
@media(max-width:360px){.avatar-choice{min-height:305px}.actor-name{font-size:15px}.actor-quote,.actor-perk{font-size:11px}.avatar-gallery{gap:7px}}
@media(prefers-reduced-motion:reduce){.avatar-choice{transition:none}}
'''
p=swap(p,'</style></head><body>',phonecss+'</style></head><body>','phone CSS')
phone.write_text(p)
print('Applied premium UI to TV and phone.')
