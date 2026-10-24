# IRON CROWN — Version 2 Design Bible

**Status:** `2.0.0-dev.11`, unreleased; rules correspond to `src/game.js`, `src/map.js` and `src/constants.js`. This document supersedes the outdated v1 design bible, preserved as `docs/history/01-iron-crown-v1-legacy.md`. If a value in an early release note disagrees with this edition, the authoritative engine is the source of truth.

## Game at a glance

Iron Crown is a private, Victorian-themed strategy game played by **2–8 rival tycoons** on one public TV/PC and private phones or browser windows. The shared display shows an evolving 37-hex country and its railway empires. Players plan **three** secret actions simultaneously each round, then watch the Crown's Gazette reveal their investments and clashes. No player is eliminated. This is a fictional succession story, inspired by but not depicting a real nineteenth-century kingdom.

### Modes and scoring thresholds (provisional until simulation acceptance)

| Mode | Rounds | Steam / Iron / Electric | Plan clock | Win target | Rules |
| --- | ---: | --- | ---: | ---: | --- |
| Quick | 8 | 3 / 3 / 2 | 40 sec | 12 | Basic rules, no advanced events/perks |
| Standard | 12 | 4 / 4 / 4 | 45 sec | 22 | Basic rules, no advanced events/perks |
| Advanced | 12 | 4 / 4 / 4 | 45 sec | 24 | Twelve shuffled Gazette events, character perks, incomplete ticket penalty |

For Quick games with **four or more players**, an early win additionally requires the leader to be at least **9 Prestige ahead** of second place. Otherwise the match continues towards scheduled round eight; the 12-Prestige target and final-round winner resolution remain unchanged. Quick with two or three players and the other modes keep the ordinary target victory trigger. Stage 11 seeded bot results support this amendment; human acceptance remains outstanding.

Royal Ledger bonuses are calculated only when the **scheduled final round** resolves, once per match, and have no effect on early winner eligibility. Target wins are checked **after each complete Reveal/Exchange/clash**, not in the middle of another player's orders. If the target is not reached by the last round, final rankings choose the winner. Balance values will only be final after the final multi-mode simulation programme.

## Components and map

37 hexes: a central unownable **Capital**, 6 Coalfields, 6 Forests, 6 Farms, 5 Steelworks, 6 Market Towns, 4 Hills, 3 separate Lakes. The seeded map generator prevents adjacent Lakes. Production tiles, Towns and Hills may be owned by human or AI; Lakes and the Capital cannot.

- **18** original Steam railroad charters (2–5 segments each); active from round 1.
- **3** new Iron-era Lake Viaducts, one crossing each Lake; hidden until the Iron era.
- **3** Electric Capital Express routes ending at the central Capital; hidden until the Electric era.
- All 24 ticket cards connect two major railway destinations and award 2–4 Prestige if completed.
- Each route is a contiguous hex-to-hex path; segments are unordered hex-edge pairs. Rival routes may not share another company's **owned** section. Your own existing sections can be reused free and are not double-counted for Longest Railway.
- A new route is legal when any tile along its path is owned by you or adjacent to your owned land; alternatively, one route endpoint is on your existing railway network. You do **not** need to own either endpoint Market Town. The server checks this again during Reveal.

## Setup

1. The TV host opens a room and displays a short join code plus a scannable QR. Each player opens the private `/phone.html` controller, enters a name and chooses one of the eight approved human portraits. AI can fill seats; there must be at least two players in total.
2. The host picks a game mode. Every participant gets three **private** Destination Tickets and keeps two or three. Secret choices, resources and orders never appear in the public TV state.
3. The engine shuffles the first-placement order independently of initial seat order. Players place two free Depots on empty Coal/Forest/Farm/Steelworks hexes in snake order, then reverse the order for the second placement. A starting Depot includes one Soldier.
4. Each player starts with **1 Coal, 1 Timber, 1 Grain, 1 Steel and 2 Gold**. At every new era, each player drafts one free card from the current era.
5. Round-one Reveal priority is randomised and advances one player per subsequent round; no tie is awarded according to seat index.

## Round phases

### 1. Income (5.5 seconds)

All players receive income automatically. A Coalfield/Forest/Farm/Steelworks produces its own resource. An owned Market Town produces **1 Gold**, upgraded City **2 Gold**; an owned Hill produces **1 Gold from Iron onward** (2 during a Gold Rush). Each active route earns **1 Gold**; Electric routes earn **2 Gold**; Express Lines add +1 per route and a connection touching the Capital adds +1. The lowest-Prestige players each receive +1 catch-up Gold. Advanced events may block or double specific production. If you own no land, the engine assigns a free available production Depot, keeping you in the match.

### 2. Secret planning (40/45 seconds)

Each player sets action slots **1, 2 and 3** independently. Repeated actions are legal except Research, which may occur at most once per round. The server validates every action, its legal targets, every troop commitment and the **combined cost** of all three actions. Bank trades can convert a resource for the remainder of the plan; the controller previews your expected resource balance. Incomplete slots become Skip when the player locks or the timer expires. All phones plan simultaneously; player plans are not visible on the TV.

### 3. Reveal and shared Exchange

Players act in rotating priority, **all three orders** for a player before the next. A now-illegal or unaffordable action fails with a **+1 Gold consolation**; its cost is not deducted. Railway claims revalidate era, accessibility, track exclusivity, ownership and affordability. New Depots and attacks enter the same target's pending clash rather than immediately deciding ownership.

All player-trade proposals pay the offered goods into escrow during Reveal. **After the last order** and **before clashes**, a single 20-second Exchange window opens if at least one offer exists. Every recipient sees their offers together and may accept or decline each; all offers resolve in Reveal order. AI recipients answer automatically. Insufficient funds/declines/expiry refund the sender's escrow. Terms are private to the relevant parties. With no offers, the market phase is skipped.

### 4. Clashes, Prestige and progression

Free-tile contested builds roll 1d6 **plus all adjacent friendly Soldiers as support** (Soldiers stay put). Every losing builder recovers the full 1 Timber + 1 Grain and gains **1 Gold**. Attacks roll 1d6 plus committed Soldiers and any bonuses. Defender bonuses: +1 if defending a Hill, +1 for a City, +1 Fortifications if held. An attacker with at least one source tile that is a Hill gains +1. Attack winners suffer one Soldier casualty; defeated attacks lose half the committed strength (rounded up). Surviving troops move according to engine settlement.

If the **defender** ties for the highest total, the defender holds the tile. Otherwise, only top-tied contenders reroll (up to three rerolls). A persistent tie is a **Stalemate**: nobody captures, build claimants are refunded with Gold and attacking Soldiers remain at home. Every original contestant, including one eliminated from reroll contention, must still be resolved and appear in the Gazette.

### Seven actions and costs

| Action | Ordinary resource cost | Rules |
| --- | --- | --- |
| Build Depot | 1 Timber + 1 Grain | Claim eligible unowned non-Lake/non-Capital tile adjacent to land or track network; ends with one Soldier. |
| Upgrade City | 2 Grain + 2 Steel + 1 Coal | Upgrade an owned Market Town; Advanced Augusta can save 1 Grain; Bessemer saves 1 Steel. |
| Lay Track | 1 Timber + 1 Steel **per new segment** | Buy whole marked route; own already-owned segments are free; Navvy Gangs and Silas discount one respective resource; Railway Mania halves applicable resource costs. |
| Recruit | 2 Gold per Soldier, up to 3 | Recruit on any owned tile. Rupert or Recruitment Drive reduces cost to 1 Gold/Soldier. |
| Trade | 3:1 Bank, or privately negotiated | Bank exchange usually trades 3 of the same resource for 1 different one; Corn Exchange, Ada or Market Crash change rate. Player trades use the 20-second shared Exchange window. |
| Research | 3 Gold + 1 Coal | One ticket or another available current-era upgrade. Once per round. Ottoline and Inventor's Fair discount Gold. |
| Attack | Commit Soldiers; no resource cost | Must be adjacent to an enemy tile; ties favour the defender; no attacks during Peace Treaty. |

## Prestige and victory

| Source | Prestige |
| --- | ---: |
| Each unupgraded owned Market Town | +1 |
| Each upgraded owned City | +2 (replaces +1 Town) |
| Owned track route with 2/3/4/5 segments | +1 / +2 / +4 / +7 |
| Each completed secret Destination Ticket | +2–4 plus Directors bonus if held |
| Unique largest army, at least 5 Soldiers | +2 |
| Unique longest continuous owned track (distinct physical segments) | +2 |
| Grand Station upgrade on a City | +2 |
| Royal Visit event/other bonuses | As authorised in the event |
| Advanced incomplete ticket | −1 per ticket |
| Final Royal Ledger (at the scheduled last round only) | +1 per 8 unused Coal/Timber/Grain/Steel combined, max +3; +1 per 4 unspent Gold, max +3 (Advanced: max +5) |

Final tie resolution: **Prestige → Gold → total distinct owned track segments → number of completed tickets**. An exact tie after all four remains a **shared victory**; crown every tied tycoon. Starting position, join order and avatar ID must never break a tie.

## Era changes and upgrades

At the start of the relevant round, the TV reveals 3 extra Lake Viaduct routes in Iron and 3 Capital Express routes in Electric. Players may not claim or see future route charters early. Each new era triggers a free draft:

- **Steam:** Navvy Gangs (−1 Timber per route, min 1), Corn Exchange (2:1 Grain bank trades), Militia (+2 Soldiers now and +1 at each following era).
- **Iron:** Bessemer Process (−1 Steel per City), Express Lines (+1 Gold per route income), Fortifications (+1 tile defence).
- **Electric:** Telegraph (one change to an unresolved order each Reveal), Grand Station (first City grants +2 Prestige), Board of Directors (+1 Prestige per completed ticket).

Advanced-mode special perks: Augusta City's Grain discount; Silas track Steel discount; Jack extra clash die; Ada special 2:1 bank resource; Rupert cheaper recruits; Nell protection against Coal Strike/Harsh Winter; Ottoline cheaper Research plus an extra draft option; Ezra one compelled favourable player trade each round. **Only Advanced mode** activates avatar perks.

The twelve Advanced events are Boom Times, Coal Strike, Harsh Winter, Gold Rush, Royal Visit, Bridge Collapse, Railway Mania, Recruitment Drive, Flood, Inventor's Fair, Peace Treaty and Market Crash. Events are shuffled and dealt across twelve Advanced rounds. Gazette notifications explain current effects; the server is authoritative.

## Multiplayer security, accessibility and assets

Public TV state includes map, open routes, player Prestige, card-free reactions and public Exchange participation. **Private phone state** includes the player's token, resources, secret tickets and their completion, ordered actions, legal targets and incoming private offers. Server WebSockets enforce host/player roles, authorise each command, support rejoin tokens and heartbeat dead connections. Room persistence uses local JSON plus an AES-encrypted host-browser recovery fallback; server storage remains ephemeral until a persistent database/disk is configured.

Phone controls should be readable on a 320px screen with one-thumb ≥56px action targets, focusable routes and high-contrast gold states. Television, PC and phones all expose How to Play and History & Lore. Audio remains opt-in; only the 17 included local Sonilo/Mirelo recordings are served and the licence file must be checked before commercial release. The user-approved **eight realistic human portraits** are the only canonical art. The 72 old tinted variants have been removed; future actual expression/costume images must be designed individually and expressly approved.

## Quality gates and final promotion

Do not tag as final 2.0.0 until: full Node+WebSocket regression suite passes; responsive TV and phone visual/browser tests cover three actions, new era routes and one shared Exchange; seeded ≥2,000 greedy-bot simulations of four and eight participants meet the agreed ±5 and ±4 percentage point seat fairness ranges, early-target win and 80%-of-target thresholds, and Prestige tie rate <8%; production-stability acceptance on real Android, iPhone, and TV is completed. Document all exceptions. The latest quantitative evidence lives in `docs/BALANCE.md`.
