> **v2 development note (Stage 3):** The proposed v2 rule changes are being tested on a development branch, not on the live Render game. The current source implements three simultaneous actions, a shared market, 18 Steam railway routes plus three Iron Lake Viaducts and three Electric Capital Express routes, and provisional targets Quick 12 / Standard 20 / Advanced 22. Balance certification is NOT complete; see `docs/BALANCE.md` for exact evidence. Older sections below describe the original design and are scheduled for consolidation in Stage 4.

# Iron Crown
### A railway empire game for the TV and phones

| | |
|---|---|
| **Players** | 2–8 (best with 4) |
| **Length** | Quick 30 min · Standard 45–60 min |
| **Age** | 10+ |
| **Setting** | An invented industrial country, 1830s–1900s |
| **Inspired by** | Catan (resources) · Ticket to Ride (routes) · Risk (territory) · Civilization (eras) |
| **Screens** | TV = shared board · Phone/tablet = private controller |

---

## 1. Synopsis

The old king is dead and the crown has passed to whoever can tie the country together with iron. Up to eight rival tycoons race to claim coalfields, forests, farms and steelworks, link towns with railways, and grow sleepy villages into roaring cities.

Every round, all players secretly plan three moves on their phones at the same time. Then the TV plays everything out: trains steam along new lines, towns sprout chimneys, and when two tycoons grab the same land, their forces clash in a single quick roll.

The country moves through three eras — **Steam, Iron and Electric** — and the board transforms around you as it does. The first tycoon to earn **20 Prestige** in Standard mode (12 in Quick or 22 in Advanced) is crowned. If nobody gets there, the richest in Prestige after the Electric era wins.

**The feeling:** a cosy, cut-throat Victorian race. Easy to learn in one round, with real decisions every turn and no one ever knocked out.

---

## 2. Game Bits (Components)

All of these are digital, drawn on the TV.

### 2.1 The Map
- **37 hex tiles** in a large hexagon (3 rings around a centre tile), generated fresh each game.
- **Tile types:**

| Tile | Produces | Count | Notes |
|---|---|---|---|
| Coalfield | Coal | 6 | Black slag heaps, pit wheels |
| Forest | Timber | 6 | Dark pines, sawmill |
| Farmland | Grain | 6 | Golden fields, windmill |
| Steelworks | Steel | 5 | Furnace glow, smoke |
| Market Town | Gold | 6 | Neutral town, starts unclaimed |
| Hills | Nothing | 4 | +1 defence to whoever holds it |
| Lake | Nothing | 3 | Cannot be claimed or crossed |
| Capital | Nothing | 1 | Centre tile, cannot be claimed, all routes worth +1 if they touch it |

- **Routes:** 18 pre-drawn railway routes between Market Towns and the Capital, each 2–5 track segments long (like Ticket to Ride). Shown as faint dotted lines until claimed.

### 2.2 Resources (shown as icons and counters on phones)
| Resource | Icon idea | Used for |
|---|---|---|
| **Coal** | Black lump | Cities, research, faster trains |
| **Timber** | Log bundle | Depots, track |
| **Grain** | Wheat sheaf | Depots, cities, soldiers |
| **Steel** | Girder | Track, cities |
| **Gold** | Sovereign coin | Soldiers, trading, research |

### 2.3 Player Pieces (one colour set per player)
| Piece | What it is | Look |
|---|---|---|
| **Depot** | Marks a tile you own | Small brick station with flag in player colour |
| **City** | Upgraded Market Town | Cluster of buildings, clock tower, chimneys |
| **Track** | Claimed route segment | Rails tinted in player colour |
| **Locomotive** | Animation only | Runs your routes each round, puffing smoke |
| **Soldier** | Defence/attack strength | Little uniformed figure, number badge shows count |

### 2.4 Cards
- **Destination Tickets (24)** — secret goals: "Connect Ashby to Port Ellery" worth 2–4 Prestige.
- **Era Upgrade Cards (9)** — 3 per era (see §6).
- **Event Cards (12)** — optional, one flips each round (see §8).

### 2.5 Trophies (shown on TV)
- **Longest Railway** (+2 Prestige)
- **Largest Army** (+2 Prestige)

---

## 3. Setup (automatic)

1. Host opens the TV page. A **room code and QR code** appear.
2. Players scan the QR on their phones, type a name and **pick an avatar**.
3. Host picks a mode: **Quick**, **Standard** or **Advanced**.
4. The TV generates the map.
5. Each player is dealt **3 Destination Tickets** and keeps **at least 2**.
6. Starting placement, in **snake order** (1-2-3-4-4-3-2-1): each player places **2 Depots** on any free production tile. Each Depot comes with **1 Soldier**.
7. Each player starts with **2 Gold** and **1 of each resource**.

---

## 4. How a Round Works

Every round has three phases. Phones show a countdown so nobody stalls.

### Phase 1 — Income (automatic, ~10 seconds)
- Every tile you own produces **1** of its resource.
- Every Market Town you own gives **1 Gold**; every City **2 Gold**.
- Every route you own pays **1 Gold** (the locomotive animation runs along it).
- **Catch-up rule:** the player in last place on Prestige gets **+1 Gold**.

### Phase 2 — Plan (simultaneous, 60–90 seconds)
On their phones, every player secretly chooses **2 actions** from the list below and taps **Lock In**. You may choose the same action twice (except Research).

### Phase 3 — Reveal (automatic, ~30–60 seconds)
- Actions resolve in **turn order**, which rotates one seat each round.
- All of player 1's actions, then player 2's, and so on.
- If something you planned is no longer possible (someone took it first), you get your resources back and a **+1 Gold** consolation.
- **Clashes** (two or more players claiming the same tile in the same round) are resolved together, at the end (see §5).

---

## 5. The Actions

| Action | Cost | Effect |
|---|---|---|
| **Build Depot** | 1 Timber + 1 Grain | Claim a free tile next to a tile you own, or next to a route you own. |
| **Upgrade to City** | 2 Grain + 2 Steel + 1 Coal | Turn an owned Market Town into a City. |
| **Lay Track** | 1 Timber + 1 Steel **per segment** | Claim a whole route. One end must touch a tile you own. |
| **Recruit** | 2 Gold per Soldier (max 3) | Place Soldiers on any tile you own. |
| **Trade** | Free | Swap with the bank at **3:1**, or send an offer to one player (see below). |
| **Research** | 3 Gold + 1 Coal | Draw a new Destination Ticket **or** buy one extra Upgrade card from the current era's leftovers. Once per round. |
| **Attack** | Free (uses Soldiers) | Target an enemy tile next to yours. Choose how many Soldiers to send from adjacent tiles. |

### Player-to-player trading
- You pick a player and build an offer: "I give 2 Coal, you give 1 Steel".
- During Reveal, their phone buzzes with the offer. They have **20 seconds** to Accept or Decline.
- Trades can't include Prestige, cards or tiles. Keep it simple.

### Attacks and Clashes (Risk-lite)
- **Strength** = Soldiers present + bonuses + **one 6-sided die**.
- **Defender bonuses:** Hills +1, City +1.
- Highest strength wins. **Ties go to the defender.**
- **Losses:** loser loses **half their Soldiers (rounded up)**; winner loses **1**.
- If the attacker wins, the tile changes owner and surviving attackers move in.
- If 3+ players clash for a free tile, everyone rolls, highest wins, all others lose half.
- Players are **never eliminated**. If you lose everything, you re-place 1 Depot free next round.

The TV shows clashes as a short animated stand-off: both avatars appear, dice tumble, the loser's face changes to *furious*.

---

## 6. Eras (Civilization-lite)

| Era | Rounds (Standard) | Board look |
|---|---|---|
| **Steam** | 1–4 | Morning light, gas lamps unlit, small engines |
| **Iron** | 5–8 | Afternoon, bigger engines, iron bridges appear |
| **Electric** | 9–12 | Dusk/night, street lights and lit windows everywhere |

At the start of each era, every player's phone shows **3 Upgrade cards**. Pick **1** for free.

| Era | Upgrade | Effect |
|---|---|---|
| Steam | **Navvy Gangs** | Track costs 1 less Timber per route (min 1). |
| Steam | **Corn Exchange** | Bank trades become 2:1 for Grain. |
| Steam | **Militia** | Gain 2 Soldiers now and 1 free each era. |
| Iron | **Bessemer Process** | Cities cost 1 less Steel. |
| Iron | **Express Lines** | Each route you own pays 2 Gold instead of 1. |
| Iron | **Fortifications** | All your tiles get +1 defence. |
| Electric | **Telegraph** | You may change one planned action during Reveal, once per round. |
| Electric | **Grand Station** | Your first City becomes a Grand Station: +2 Prestige. |
| Electric | **Board of Directors** | Each completed Destination Ticket is worth +1 extra Prestige. |

---

## 7. Prestige and Winning

| Source | Prestige |
|---|---|
| Each Depot on a Market Town | 1 |
| Each City | 2 |
| Each completed Destination Ticket | 2–4 (printed on card) |
| Longest Railway trophy | 2 |
| Largest Army trophy | 2 |
| Grand Station upgrade | 2 |

- **Instant win:** first to the mode’s Prestige target at the end of a Reveal phase.
- **Otherwise:** after round 12, highest Prestige wins.
- **Tie-break:** most Gold, then most routes.
- Unfinished tickets cost nothing in Standard. In Advanced they cost **−1 each**.

---

## 8. Event Cards (Advanced, optional)

One event flips at the start of each round and is shown as a newspaper headline on the TV.

| Event | Effect |
|---|---|
| **Boom Times** | All income doubled this round. |
| **Coal Strike** | Coalfields produce nothing. |
| **Harsh Winter** | Farmland produces nothing. |
| **Gold Rush** | Hills produce 1 Gold this round. |
| **Royal Visit** | Whoever owns the most Cities gets +1 Prestige. |
| **Bridge Collapse** | One random route is blocked this round (pays nothing). |
| **Railway Mania** | Lay Track costs half (round up). |
| **Recruitment Drive** | Recruit costs 1 Gold per Soldier. |
| **Flood** | Tiles next to Lakes produce nothing. |
| **Inventor's Fair** | Research costs 1 Gold less. |
| **Peace Treaty** | No attacks this round. |
| **Market Crash** | Bank trades are 4:1 this round. |

---

## 9. Game Modes

| Mode | Rounds | Win at | Extras |
|---|---|---|---|
| **Quick** | 8 (eras of 3/3/2) | 12 Prestige | No events, no avatar perks |
| **Standard** | 12 | 20 Prestige | No events, no avatar perks |
| **Advanced** | 12 | 22 Prestige | Events on, avatar perks on, unfinished tickets −1 |

---

## 10. The Avatars (8 Tycoons)

Each avatar has: a portrait, **3 expressions** (Neutral, Smug, Furious), **3 era outfits**, a colour, and a small **perk** (Advanced mode only).

| # | Name | Title | Colour | Look | Perk |
|---|---|---|---|---|---|
| 1 | **Lady Augusta Blackwood** | The Duchess | Crimson `#B3261E` | Silver-haired aristocrat, pearl choker, raised eyebrow | Cities cost 1 less Grain. |
| 2 | **Silas Brunel-Crane** | The Engineer | Royal Blue `#1F4FA8` | Lanky, soot-smudged, rolled sleeves, pencil behind ear | Lay Track costs 1 less Steel per route. |
| 3 | **"Lucky" Jack Hartigan** | The Gambler | Emerald `#1E7A46` | Grinning, waistcoat, dice on a watch chain | Re-roll your die once per clash. |
| 4 | **Mrs Ada Pennyworth** | The Banker | Gold `#C99A2E` | Neat bun, half-moon spectacles, ledger under arm | Bank trades are 2:1 for one resource of her choice each era. |
| 5 | **Colonel Rupert Fairfax** | The Colonel | Navy `#22305A` | Big moustache, medals, ramrod straight | Recruit costs 1 Gold per Soldier. |
| 6 | **Nell Thackery** | The Union Boss | Burnt Orange `#C2571A` | Flat cap, scarf, fierce grin, sleeves up | Immune to Coal Strike and Harsh Winter events. |
| 7 | **Professor Ottoline Vex** | The Inventor | Violet `#6B3FA0` | Wild hair, brass goggles, glowing gadget | Research costs 1 Gold less and you see 4 Upgrade cards, not 3. |
| 8 | **Mr Ezra Coldwell** | The Smuggler | Teal `#167B7B` | Long coat, collar up, sly sideways look | Once per round, one trade with another player can't be declined if it's 2-for-1 in their favour. |

### Era outfits
| Avatar | Steam | Iron | Electric |
|---|---|---|---|
| Duchess | Bonnet, shawl | Feathered hat | Tiara, electric-lit brooch |
| Engineer | Cap, overalls | Top hat, frock coat | Bowler, lightbulb tie-pin |
| Gambler | Flat cap | Bowler | White dinner jacket |
| Banker | Plain dress | Fur collar | Pearl necklace, lorgnette |
| Colonel | Red tunic | Khaki jacket | Dress uniform with sash |
| Union Boss | Shawl | Union badge | Megaphone in hand |
| Inventor | Goggles up | Goggles down, sparks | Crackling coil on shoulder |
| Smuggler | Fisherman's coat | Long greatcoat | Silk scarf, cigarette holder |

### Expression rules (TV)
- **Smug:** win a clash, complete a ticket, take a trophy, upgrade to City.
- **Furious:** lose a clash, lose a trophy, a planned action fails.
- **Neutral:** default; returns after 4 seconds.

---

## 11. UI Design

### 11.1 Visual style
- **Theme:** Victorian railway poster meets storybook miniature.
- **Board:** isometric, slightly tilted, painted look, warm lighting.
- **Feel:** brass, polished wood, enamel signs, steam.

### 11.2 Colour palette
| Role | Light mode | Dark mode |
|---|---|---|
| Background | Parchment `#F3E9D2` | Coal `#16130F` |
| Panel | Varnished wood `#5A3A22` | Dark oak `#2A1D13` |
| Accent | Brass `#C9A227` | Brass `#E2BC3B` |
| Text main | Ink `#1C1712` | Cream `#F5EBD5` |
| Text muted | `#5E5246` | `#B9AC95` |
| Good | `#2E7D32` | `#5CC163` |
| Bad | `#B3261E` | `#FF6B5E` |

All text must reach **WCAG AA contrast** (4.5:1) in both modes.

### 11.3 Fonts (bundled as woff2, no internet)
- **Headings:** *Playfair Display* (bold, Victorian feel).
- **Body and numbers:** *Inter* (very clear on phones).
- Minimum phone text size **16px**; numbers on resource counters **24px+**.

### 11.4 TV screen layout (16:9)
```
┌──────────────────────────────────────────────────────────────┐
│ ERA: STEAM ▸ Round 3/12      PHASE: PLAN  ⏱ 0:42   EVENT ▸ … │  ← top bar
├──────────┬───────────────────────────────────────────────────┤
│ Avatar 1 │                                                   │
│ ★ 7  ●●  │                                                   │
│ Avatar 2 │              THE MAP (≈75% of screen)             │
│ ★ 5  ✔   │                                                   │
│ Avatar 3 │                                                   │
│ ★ 4  …   │                                                   │
│ (up to 8)│                                                   │
├──────────┴───────────────────────────────────────────────────┤
│ Ticker: "Silas laid the Ashby–Port Ellery line!"   Trophies  │  ← bottom bar
└──────────────────────────────────────────────────────────────┘
```
- **Left rail:** each player's avatar, Prestige star count, and a status badge (✔ locked in, … thinking).
- **Trophies** sit bottom-right with the current holder's portrait.
- During Reveal, the camera **gently zooms** to each action as it happens.

### 11.5 Phone screens (portrait, one thumb)
| Screen | Contents |
|---|---|
| **Join** | Room code box, name field, big Join button. |
| **Avatar Pick** | 2×4 grid of portraits; taken avatars greyed out. |
| **Lobby** | "Waiting for host", list of players, your avatar large. |
| **Plan** (main) | Top: 5 resources + Gold + Prestige. Middle: 2 action slots. Bottom: 6 action buttons, then **Lock In**. |
| **Target Picker** | Mini-map; tap a highlighted tile/route. Only legal choices glow. |
| **Trade Builder** | Two columns: "I give" / "I want", +/− steppers, player picker. |
| **Trade Offer** | Incoming offer with 20s ring timer, Accept / Decline. |
| **Era Draft** | 3 large Upgrade cards, swipe or tap to pick. |
| **Tickets** | Your secret Destination Tickets, ✔ when complete. |
| **Watch** | During Reveal: "Watch the TV!" plus your own result summary. |
| **Results** | Final ranking, your Prestige breakdown. |

- **Buttons:** minimum **56px tall**, thumb zone at bottom third.
- **Haptics:** short buzz on trade offer and clash.
- **Interruptible:** if the phone sleeps or refreshes, it rejoins automatically.

### 11.6 Animation and sound
- Locomotives travel routes during Income (2 seconds each, all at once).
- Depots "pop" up with a bounce; Cities build in 3 quick stages.
- Era change: a sweep of light across the board, buildings swap to new versions, brass fanfare.
- Sounds: train whistle, coin clink, dice rattle, crowd "ooh" on clashes, gentle music-hall background loop. Volume and mute on TV.

---

## 12. Art Production (no budget)

Use one consistent style prompt for every image so nothing clashes.

**Master style line (paste at the start of every image prompt):**
> Isometric painted miniature, Victorian railway poster style, warm golden lighting, soft shadows, rich brass and deep green palette, clean edges, transparent background, high detail, no text.

**Example prompts**
- *Coalfield tile:* "[style line] A single hexagonal tile of English coal country: slag heaps, a pit winding wheel, a small cottage, dark earth."
- *City piece:* "[style line] A small Victorian city cluster with a clock tower, red-brick terraces and chimneys, flag in crimson."
- *Avatar:* "[style line, but portrait not isometric] Bust portrait of a silver-haired Victorian duchess with a pearl choker and a raised eyebrow, neutral expression, crimson accents, painted storybook style, plain background."
- Make the **3 expressions** by keeping the same prompt and changing only the expression words.

---

## 13. Technical Notes

- TV and phones **must talk to each other**, so this needs a small **server** (e.g. Node.js on Render or Oracle).
- The server holds the true game state. TV and phones only display it and send choices.
- Everything else (art, fonts, sounds) is **bundled** — no CDNs, no external requests apart from the game server.
- Phones store a **rejoin token** in localStorage so a refresh puts them back in their seat.

---

## 14. Full Build Prompt

Copy everything inside the box into your AI coding tool.

```text
You are a senior game developer. Build "Iron Crown", a multiplayer railway
strategy board game played on a TV (host screen) with phones/tablets as
private controllers.

ARCHITECTURE
- Node.js server using the "ws" WebSocket package only. No other runtime deps.
- Server is authoritative: it holds all game state, validates every action,
  resolves Reveal, and broadcasts state.
- Serve three files from /public: tv.html (host/board), phone.html
  (controller), and shared assets (woff2 fonts, PNG/SVG art, sounds).
- Each HTML file is self-contained (inline CSS and JS). No CDNs, no external
  requests other than the WebSocket back to the same server.
- Rooms: TV creates a room and shows a 4-letter room code and a QR code
  (generate QR in-page with a small inline QR encoder) pointing to
  phone.html?room=CODE.
- Phones store {room, playerId, token} in localStorage and auto-rejoin on
  refresh or reconnect. Show "Reconnecting…" banner while disconnected.
- Support 2–8 players. Host can kick a player or replace them with a basic
  AI that takes random legal actions.

RULES (implement exactly)
- Map: 37-hex hexagon (radius 3). Tiles: 6 Coalfield(Coal), 6 Forest(Timber),
  6 Farmland(Grain), 5 Steelworks(Steel), 6 Market Town(Gold), 4 Hills
  (no production, +1 defence), 3 Lake (unclaimable, impassable), 1 Capital
  (centre, unclaimable). Shuffle all except Capital. Re-roll if two Lakes
  touch.
- 18 routes between Market Towns/Capital, each 2–5 segments, generated by
  pathfinding across non-Lake hexes. Routes touching the Capital are worth
  +1 Gold income.
- Setup: each player gets 2 Gold + 1 of each resource. Deal 3 Destination
  Tickets (pairs of towns, value 2–4 by distance); player keeps 2 or 3.
  Snake-order placement of 2 Depots on free production tiles, each with
  1 Soldier.
- Round = Income -> Plan -> Reveal.
- Income: each owned production tile +1 of its resource; Market Town +1 Gold;
  City +2 Gold; each owned route +1 Gold (+1 if touching Capital).
  Last place in Prestige gets +1 Gold.
- Plan: each player secretly picks 2 actions (Research max once). Timer 90s
  (60s in Quick). If timer expires, unchosen slots become "Trade 3:1 skipped".
- Actions:
  Build Depot (1 Timber, 1 Grain) on free tile adjacent to owned tile/route.
  Upgrade to City (2 Grain, 2 Steel, 1 Coal) on owned Market Town.
  Lay Track (1 Timber + 1 Steel per segment) claim whole route; one end must
    touch an owned tile.
  Recruit (2 Gold each, max 3) on owned tiles.
  Trade: bank 3:1, or offer to one player (accept/decline 20s during Reveal).
  Research (3 Gold, 1 Coal): new Destination Ticket OR buy 1 leftover Upgrade.
  Attack: choose enemy tile adjacent to own tile; commit Soldiers from
    adjacent own tiles.
- Reveal: resolve players in rotating turn order. Failed actions refund cost
  and give +1 Gold. Collect all claims/attacks on the same tile and resolve
  as clashes at end of Reveal.
- Clash: strength = soldiers + bonuses (Hills +1, City +1, Fortifications +1)
  + 1d6. Ties to defender. Loser loses ceil(half) soldiers, winner loses 1.
  Winning attacker takes tile and moves survivors in. 3+ way: highest wins.
- No elimination: a player with zero tiles places 1 free Depot next round.
- Eras: Steam rounds 1–4, Iron 5–8, Electric 9–12 (Quick: 3/3/2). At each era
  start, show each player 3 Upgrade cards; they pick 1:
  Steam: Navvy Gangs, Corn Exchange, Militia.
  Iron: Bessemer Process, Express Lines, Fortifications.
  Electric: Telegraph, Grand Station, Board of Directors.
  (Effects as in design doc.)
- Prestige: Depot on Market Town 1, City 2, completed ticket 2–4,
  Longest Railway 2 (most connected segments, ties: no one holds it),
  Largest Army 2 (most Soldiers, min 5), Grand Station 2.
- Win: 15 Prestige after any Reveal (10 in Quick), else highest after last
  round. Tie-break: Gold, then routes.
- Advanced mode: 12 event cards (one per round), avatar perks on,
  unfinished tickets -1.

AVATARS (8): Lady Augusta Blackwood (Duchess, #B3261E), Silas Brunel-Crane
(Engineer, #1F4FA8), "Lucky" Jack Hartigan (Gambler, #1E7A46), Mrs Ada
Pennyworth (Banker, #C99A2E), Colonel Rupert Fairfax (#22305A), Nell Thackery
(Union Boss, #C2571A), Professor Ottoline Vex (Inventor, #6B3FA0), Mr Ezra
Coldwell (Smuggler, #167B7B). Each has neutral/smug/furious portraits and
3 era outfits. Load images from /public/art/avatars/{id}_{era}_{mood}.png;
if missing, draw a placeholder circle in their colour with initials.

TV UI
- 16:9. Top bar: era, round, phase, timer, event headline. Left rail: player
  avatars with Prestige and lock-in status. Centre: isometric hex map (SVG or
  canvas). Bottom: news ticker and trophy holders.
- Animate: locomotives along owned routes in Income, Depot pop, City build
  in 3 stages, clash stand-off with dice, era sweep that swaps building art
  and lighting (morning -> afternoon -> night with lit windows).
- Sound: whistle, coins, dice, crowd, background loop; mute toggle.

PHONE UI
- Portrait, one-thumb, buttons >= 56px, text >= 16px, counters >= 24px.
- Screens: Join, Avatar Pick, Lobby, Plan, Target Picker (mini-map with only
  legal targets highlighted), Trade Builder, Trade Offer (20s ring timer),
  Era Draft, Tickets, Watch, Results.
- Vibrate on trade offer and clash (navigator.vibrate if available).

DESIGN SYSTEM
- Fonts: Playfair Display (headings), Inter (body), bundled woff2.
- CSS variables for colour on :root with a prefers-color-scheme: dark
  override. Light: bg #F3E9D2, panel #5A3A22, accent #C9A227, text #1C1712.
  Dark: bg #16130F, panel #2A1D13, accent #E2BC3B, text #F5EBD5.
- All text WCAG AA contrast. Readable in bright sunlight and darkness.

QUALITY
- Write complete, production-ready code. No placeholders or TODOs.
- Include a README with: install, run locally, deploy to Render.
- Include a rules screen on both TV and phone.
- Include a 1-round interactive tutorial on first play.
```
