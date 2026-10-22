## Phase 3 v1.4.0 — The eight tycoons

The phone character picker now offers an eight-person premium portrait roster and private interactive dossiers. Each dossier previews all three eras and three mood asset paths, details the persona, and explains the Advanced-only perk. The host screen adds a **Meet the Tycoons** gallery accessible from the TV top bar. These changes are presentation-only and preserve the authoritative game rules. See `PHASE-3-V1.4-RELEASE-NOTES.md` for test evidence and the remaining independent-artwork caveat.

# IRON CROWN

A private, cross-device Victorian railway empire game. One browser window is the **shared TV board**; two to eight phones/tablets are **secret controllers**. The Node.js server validates all orders and owns the authoritative state.

## Get running locally

Requires **Node.js 20 or newer**.

```bash
npm install
npm start
```

Open **http://localhost:3000/** on the host screen. You will see a four-letter room code and an in-page QR code. Open the QR URL or `http://localhost:3000/phone.html?room=CODE` on a phone. Both devices **must reach the same server**. `localhost` on a phone refers to the phone, not your computer: use your computer's LAN IP or an HTTPS deployment instead.

For development: `npm run dev`. To run the automated rules suite: `npm test`.

## Host an evening

1. Open the TV URL. It creates a fresh private room, saving the host credential in browser storage so a refresh rejoins the room.
2. Invite 1–7 other friends (at least two players total), each with a separate device or tab. Enter a name and pick one of eight available tycoons.
3. Select **Quick**, **Standard**, or **Advanced**. Use **+ Add AI** for a computer-controlled seat or **AI** beside a human to replace them. The host can remove lobby players; in-progress removals transfer the seat to AI to protect game continuity.
4. Start. Each player chooses two of three secret tickets, then places two free Depots in snake order. Every era begins with a free Upgrade draft.
5. The TV shows Income → simultaneous phone Plans → Reveal. Actions are validated and resolved by the server. Unfilled action slots pass automatically. Trade offers are handled on the recipient's phone.
6. First to the mode's Prestige target wins at the end of Reveal, or the highest score after the last round. The host can start a rematch.

### Modes

| Mode | Rounds | Era lengths | Win target | Rules |
| --- | ---: | --- | ---: | --- |
| Quick | 8 | 3 / 3 / 2 | 10 Prestige | 60-second planning; no events/perks |
| Standard | 12 | 4 / 4 / 4 | 15 Prestige | 90-second planning; no events/perks |
| Advanced | 12 | 4 / 4 / 4 | 15 Prestige | 12 shuffled events; character perks; unfinished-ticket penalty |

### First-round tutorial

On a first visit, the phone offers contextual guidance through the first round: avatar selection, secret tickets, starting Depots, era Upgrade, planning and watching Reveal. The guidance accompanies real, interactive actions rather than a simulated game; it dismisses automatically after the first round and can be hidden. Players may open **Rules** on either screen at any time.

## Phase 2 — The Living Country (v1.1.0)

The country board is now a layered, illustrated isometric miniature rather than a flat resource-symbol chart. **All art is inline SVG**, so the map has no additional runtime or network dependency.

- Eight visually distinct terrains: coalfields with pit winding gear, pine forests, grain fields and windmills, foundries, Victorian towns, defensive hills, water-filled lakes and the central Capital.
- Raised hex sides, subtle lighting and personalised ownership borders, flags, depot soldiers and City buildings.
- The server still generates **37 hexes**, **18 distinct 2–5-segment railway routes** and **24 Destination Tickets**. Route selection now balances town and Capital coverage, with a broader mix of track lengths. A supplied seeded RNG now reproduces routes and ticket shuffling for debugging.
- Unbuilt routes are shown as dotted proposals; completed railways gain coloured rails, sleepers and animated trains during Income. Closed routes use a warning colour.
- The TV offers +/− zoom, reset, town-label toggle, map key, hover descriptions of production/ownership, and short action-focused camera movement during Reveal.
- The private phone map uses the same terrain colours, thick colour-coded ownership, and **gold dashed legal-target outlines**. Railway selection has a larger touch hitbox and a full text list for precision.
- Local preview images of the TV board and phone target picker are supplied separately with the release archive, not used as game assets.

**Phase 2 checks:** 16 automated tests pass. Browser rendering checks also verified 37 hexes, 18 railways, tooltips, zoom/labels, and legal target filtering on both screen types without JavaScript runtime exceptions in the test harness. These are synthetic-browser checks; **they do not replace real TV/phone networking tests**.

## Phase 3 — The Tycoons Arrive (v1.2.0, first integration)

**Working premium UI:** the TV lobby now uses the approved gold/brass Iron Crown logo, a Victorian terminal atmosphere, a real, scannable local QR encoder, room management, a playable host interface and an eight-character portrait parade. The phone joining page, character chooser, player identity and Reveal screens now use the same art direction. No generated screenshot is presented as a fake clickable menu: all controls are HTML wired to the original socket protocol.

**Eight realistic human portraits:** Augusta, Silas, Jack, Ada, Rupert, Nell, Ottoline and Ezra are all bundled from the approved artwork. The 72 paths required by the game bible still exist (eight people × three eras × three moods), with eight extra transparent master portraits. These are *graded lighting and decorative-frame variations of the same human faces*: they do **not** yet contain 72 independently posed facial expressions or the nine distinct period costumes per character. That remaining illustration task belongs to later Phase 3 art production.

**Character personality:** the character picker includes their titles and Advanced-only perks; the phone lobby features a large portrait and biography line. The TV uses the actual authoritative clash results to show the winner's and losers' faces with success/defeat framing, while the phone identifies the player during planning, trading and Reveal. Original rules, scores, room messages and saved game format are unchanged.

**QA:** `npm test` passes 18 offline checks, including asset coverage and premium UI wiring. Extracted inline scripts pass `node --check`. This environment still has no installed `ws` dependency, so the actual server-to-phones WebSocket system and real-device visuals remain to be tested after `npm install`. The first integration could not capture Chromium screenshots; v1.3.0 now adds a synthetic offline browser-rendering check (see above).

## Phase 3 continuation — Responsive Tycoon Personalities (v1.3.0)

The authoritative server now publishes time-limited **four-second character moods** when a player founds a City, fulfils a Destination Ticket, gains or loses a trophy, wins or loses a clash, has an order fail or wins the game. Both screens show the change immediately and return to neutral even without another state message. The TV gazette now honours these events and the phone reveals the tycoon's current mood without exposing any secret destination details.

Phone Upgrade drafts now feature the selected human tycoon and bespoke Steam / Iron / Electric introductory copy. Each era adjusts the roster and portrait treatment, and local monogram fallbacks are generated if a portrait file is unavailable. The TV's header contrast, phone reaction text, small phone labels and minimum touch targets received an accessibility pass; timer formatting now uses `m:ss`.

**Tests and limitations:** 23 automated Node checks pass, including five new targeted reaction checks. An offline Chromium smoke test successfully rendered the TV lobby, board and phone in all three test snapshots, with no JavaScript errors. This is *not* live-network or real-device testing. The supplied 72 portrait files are still colour/framing adaptations of the eight approved realistic humans, **not** 72 individually posed facial expressions or era costumes. See `PHASE-3-CONTINUATION-NOTES.md`.

## Architecture

- `src/server.js` — built-in HTTP server + one runtime package, **ws**, for WebSockets; room identity and reconnect authentication, timers, broadcast, and optional on-disk snapshots.
- `src/map.js` — 37-radius-3-hex generation with non-adjacent Lakes; 18 paths of 2–5 non-Lake segments; 24 destination cards; rail connectivity.
- `src/game.js` — authoritative turn state machine, validations, simultaneous claims, combats, trades, upgrades, events, scoring, AI and winner rules.
- `src/constants.js` — authoritative modes, avatars, upgrades, events, map counts.
- `public/tv.html` — self-contained host interface with built-in QR encoder, painted SVG map, animated locomotives, player roster, Prestige board, trophy panels and browser-synthesised sound.
- `public/phone.html` — self-contained one-thumb controller, reconnection, target map, plan slots, trading, tickets, era draft, tutorial and results.
- `public/art/avatars` — **72 locally bundled realistic portrait variants**: eight tycoons × three eras × three mood treatments, plus eight approved transparent human masters. Era and mood variants are colour/frame treatments and do not yet provide different photographic outfits or facial expressions; fallback colours if an image fails to load.
- `public/art/iron-crown-crest.svg` — original locally bundled crest.
- `test/game.test.js` — Node's built-in test runner, with procedural map, game rules and Phase 3 image/interface integrity tests.

No external image services, JavaScript CDNs, external style sheets, or sound hosts are required. TV sound effects and the optional music-hall-style background melody are synthesised in the browser when enabled by a user gesture.

### Rendering and private data

Public state excludes player credentials, secret Destination Tickets, un-revealed actions and resource inventories. Only the authenticated player's socket receives that player's private view. A reconnect token is persisted in browser `localStorage` and is checked on the server. UI choices are advisory; the engine rechecks legality and available resources.

### State persistence

By default, room snapshots are written atomically to `.data/rooms.json`. Override the location with `STATE_FILE=/path/to/rooms.json` or set `STATE_FILE=''` to disable disk snapshots. **A Render instance's default filesystem is ephemeral**. To preserve games through instance replacement, configure a persistent disk and set `STATE_FILE` to a path on that disk. Rooms do **not** synchronise across multiple server instances; deploy one instance, or add an external coordinated state store before scaling horizontally.

## Deploy to Render

1. Push the folder's contents to a new GitHub repository.
2. On Render choose **New → Blueprint**, select the repository, and use the supplied `render.yaml`. Alternatively create a Node Web Service with build `npm install --omit=dev`, start `npm start`, and health check `/health`.
3. For better session stability use a paid always-on instance, HTTPS and one instance only. Configure the optional persistent disk if games must survive full server restarts.
4. Open your deployed `https://…onrender.com/` URL on the TV. Players scan the on-screen QR code. `wss://` is used automatically on HTTPS.

Render assigns its own `PORT` environment variable. The server honours it and binds to `0.0.0.0`.

## Tests and release verification

`npm test` includes 23 checks, including seeded map reproducibility, Capital-to-town route connectivity, balanced route lengths, and checks for 120 procedural maps (distribution, non-touching Lakes, path lengths and adjacency), private ticket selection, resource budgeting, clash progression, scoring, trade rejection, Advanced costs, automatic re-entry, self-contained browser scripts and a complete simulated Quick game with AI.

**Run real-device acceptance tests before a public launch.** In particular: connect at least two real phones and a TV simultaneously; lock plans from both phones; offer/decline a trade; leave and rejoin during an active round; switch networks; try all eight tycoons; verify Quick/Advanced and all 12 events; test the Telegraph timing; inspect the interface on low-end phones; and verify Render restart/recovery.

## Design-bible clarifications

The accompanying `01-iron-crown.md` is the game's authoritative design bible. Two minor rule ambiguities were resolved explicitly rather than inventing unrelated gameplay:

- The bible specifies **nine total Upgrade cards** (three each era), but the Inventor is also supposed to see **four cards**. The Inventor's fourth displayed option, *Experimental Patent*, commissions one random available published Upgrade. No tenth unique Upgrade effect was invented.
- The deck has **24 tickets**, which can be completely dealt to eight players (three each). Tickets discarded in initial selection return to the deck, allowing Research to draw them. If everyone keeps all three, the deck is empty until cards become available; Research refunds if empty.

**Font limitation:** Browser-offline system fonts are used for the deliverable (`Georgia`/system sans-serif). The requested Playfair Display and Inter binary font files are not distributed in this package. Use appropriately licensed versions as local assets in a future art integration pass if exact font matching is required. No external font service is contacted.

**Verification scope:** The engine suite passes locally. The current build environment cannot fetch the required `ws` npm package from the registry, so a full browser-to-server WebSocket acceptance run has **not** been performed here. `npm install` on a network-connected developer machine or Render should install the declared dependency normally; verify it there before treating the build as release-approved.

## Phase 3.5 — Approved human portraits throughout (v1.5.0)

All eight original human portrait files (`{id}_human.png`) now appear in every phone and TV screen, including dossiers, lobby, gallery, planning, trade, Reveal, results and the TV character stand-offs. Old era/mood variants are no longer referenced by live UI images. URLs use `?v=1.5.0` to avoid stale caches. The server remains authoritative for character reactions, now conveyed with framing and status text rather than falsely implying newly drawn facial poses. Bespoke outfits and expressions remain future illustration work.

Quality: 28 Node tests passed and offline Chromium visual checks exercised all eight dossiers and major TV/phone character views using the bundled PNG artwork. Real multiplayer devices and deployment are not yet acceptance-tested.

## Phase 4 — Gameplay reliability (v1.6.0)

Planned orders now reserve soldiers across both slots. Duplicate attacks on one territory combine into one combatant and one die roll, Telegraph replacements are revalidated, trade payloads reject inherited keys, and computer opponents attempt all seven actions. Your phone shows the authoritative projected resource balance and current bank rates. See `PHASE-4-RELEASE-NOTES.md` for QA and limitations.

## Phase 5 — Railway Empire (v1.7.0)

Iron Crown now derives secret Destination Ticket completion on the server and shares a private progress summary only with the ticket owner. The TV does not reveal the hidden Ticket IDs. Longest Railway trophy lengths count physical track sections once, and the Advanced Market Crash event enforces its 4:1 exchange rate for that round. Research, era drafts, Prestige, trophies and tie-breaking have an additional 14 regression tests.

Run `npm test` (53 cases); for the offline phone contract review run `python tools/phase5_browser_qa.py` with Playwright/Chromium installed. See `PHASE-5-RELEASE-NOTES.md` for complete scope and outstanding acceptance checks.
