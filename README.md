# IRON CROWN

**A cinematic, private Victorian railway empire game for 2–8 players.** One TV or computer displays the shared railway kingdom; each human uses a phone, tablet or a separate computer window to plan secret orders. The Node.js/`ws` server validates every move. Includes eight approved human tycoon portraits, 17 preserved original recordings plus 17 mastered editions, eight new bespoke railway effects and a new original instrumental parlour score, an accessible How to Play handbook and fictional railway lore.


**Stage 12 (24 October 2026):** Two independent 2,000-game eight-player Quick samples passed both formal seat and tie gates, with early victories of 31.85% and 31.30%. Added a 512 KiB outgoing WebSocket queue cap, authenticated eight-seat reconnect/restart tests, oversized-message and origin checks. GitHub v2 is still in an isolated review branch; release gates for real devices, audio rights and durable hosted recovery are not cleared.

**Stage 11 (24 October 2026):** Quick four- to eight-player games now need a nine-Prestige advantage to clinch an early Crown once a player reaches 12. Two independent 2,000-game four-player greedy-bot samples pass all four fairness gates; the same-seed two-player 2,000-game metrics are unchanged. This is a staging-only balancing change. Eight-player Quick passed two independent 2,000-game seeded benchmark samples during Stage 12; real human enjoyment and cross-network/physical-device acceptance remain outstanding.

**Stage 10 GitHub verification (24 October 2026):** 177/177 actual Node and WebSocket tests passed; all nine bespoke provider MP3s decoded and bundled locally alongside the 17 original and 17 mastered recordings. Quick 4-player balancing, physical device tests, hosting durability and independent commercial redistribution clearance remain unresolved. GitHub `main` and production Render have not been promoted.

> **v2.0.0-dev.12 — STAGING-ONLY DEVELOPMENT BUILD, NOT THE LIVE GAME.** The existing production game remains unchanged. Standard and Advanced 4-player statistical gates passed their recorded 2,000-game seeded samples; new Quick 4-player balance evidence is under review, and real multiplayer/device acceptance remains outstanding. Do not deploy this ZIP to Render or `main` before network/browser acceptance and balance gates pass.

## Get running locally

Node.js 20+:

```bash
npm install
npm test
npm start
```

Open `http://localhost:3000/` on the TV/PC and `http://localhost:3000/phone.html` on player devices. Phones must use the host's LAN address or the actual HTTPS deployment; `localhost` on the phone refers to the phone itself.

Run `npm run dev` for development. The one runtime dependency is `ws` (minimum 8.22.0 for security). All JS/CSS is inline in `public/tv.html` and `public/phone.html`; no runtime framework, CDN or external font/audio services are required.

## Host an evening

1. Open the TV page and share its four-letter room code/QR with 1–7 friends.
2. Players join from their private controllers, name themselves and choose unique tycoons; optional AI can fill empty seats.
3. Select Quick, Standard or Advanced. Each player privately keeps at least two of three Destination Tickets.
4. Place two free production Depots in a randomised, snake-order opening draft.
5. At each era change, choose a free Upgrade. Then every round follows **Income → three simultaneous secret orders → Reveal → one Exchange window if needed**.
6. First to reach the mode's Prestige target at a round's end wins; otherwise the highest final Prestige wins (then Gold, unique owned rail segments and completed tickets; unresolved ties share the Crown). The host can invite the same group to a rematch.

**How to Play** is visible on TV and phone. **History & Lore** explicitly distinguishes fiction from real nineteenth-century railway history. TV and controller audio are both opt-in; the TV has Quiet/Balanced/Cinematic profiles.

## Modes (current development targets)

| Mode | Rounds | Planning per round | Steam / Iron / Electric | Prestige target | Other mechanics |
|---|---:|---:|---|---:|---|
| Quick | 8 | 40 seconds | 3 / 3 / 2 | 12 | Fast, no events/perks |
| Standard | 12 | 45 seconds | 4 / 4 / 4 | 22 | No events/perks |
| Advanced | 12 | 45 seconds | 4 / 4 / 4 | 24 | 12 shuffled events, eight unique perks, unfinished-ticket penalty |

**Standard four/eight-player and Advanced four-player passed their recorded 2,000-game seeded acceptance checks.** This does not establish a complete release or human-play acceptance. See `docs/BALANCE.md` for dates, seeds and limitations. A new 2,000-game Quick four-player sample **fails its early-victory gate (66.25% vs 30–50%)**, so Quick four-player balance is a release blocker.

## Rules summary

- **Map:** 37 hexes, 18 Steam routes, three additional Iron viaducts crossing Lakes, three Electric express routes to the Capital, 24 destination tickets. Era routes are hidden and unavailable until unlocked.
- **Actions:** Build Depot (1 Timber + 1 Grain), upgrade owned Market Town to City (2 Grain + 2 Steel + 1 Coal), Lay Track (1 Timber + 1 Steel per newly owned route segment), Recruit (2 Gold per Soldier, up to 3), Trade (bank normally 3:1 or an offer to another player), Research (3 Gold + 1 Coal, once per round), and Attack (commit adjacent Soldiers and roll 1d6). Perks and era cards can reduce costs.
- **Rail access:** Adjacent to owned land or connected to your existing rail network. Rivals cannot claim track segments already owned by another company; own reused segments cost nothing.
- **Clashes:** Adjacent supporting Soldiers help free-tile builds; ties between non-defenders reroll up to three times, then become a stalemate. Every losing build claimant receives full cost refund plus 1 Gold. Hills support attacks from owned Hill tiles; defender wins equal-strength ties.
- **Exchange:** All accepted offers settle in one shared 20-second market. Unaccepted or unaffordable trades return the sender's escrow. Private terms stay off the shared TV.
- **Prestige:** Town Depot +1; City +2; completed ticket +2–4; each owned route 2/3/4/5 segments earns +1/+2/+4/+7; Largest Army +2; Longest Railway +2; Grand Station +2. Advanced mode deducts 1 per unfinished ticket.
- **Final Royal Ledger:** At the scheduled last round only, the Crown grants +1 Prestige per 8 surplus Coal/Timber/Grain/Steel combined (up to +3) and +1 Prestige per 4 Gold (up to +3, or +5 in Advanced). No early winner receives these points.
- **Hills:** +1 Gold per Hill from Iron onwards; Gold Rush event pays 2 Gold per Hill for that round.

See `01-iron-crown.md` for the **authoritative v2 design bible** and `HOW-TO-PLAY-AND-LORE.md` for player-facing explanations.

## Architecture

- `src/game.js`: authoritative phases, legality, turns, trading, conflict, Prestige, AI and privacy.
- `src/map.js`: seeded 37-hex layout, routes, era bridges, Capital express and ticket connectivity.
- `src/constants.js`: costs, cards, tycoons, provisional winning thresholds and round lengths.
- `src/server.js`: room-host WebSockets, private/public state, liveness and HTTP file delivery.
- `src/recovery.js`: encrypted host-browser fallback for ephemeral server storage.
- `public/tv.html` / `public/phone.html`: responsive shared and private screens.
- `public/art/avatars`: **only eight approved `_human.png` portraits**; retired derivatives removed in Stage 4.
- `public/audio`: 17 locally hosted original recordings plus their SHA-256 provenance inventory.

## Simulation

```bash
npm run sim -- --players 4 --mode standard --games 2000 --seed 20261023 --bots greedy
npm run sim -- --players 8 --mode standard --games 2000 --seed 20261023 --bots greedy
npm run sim -- --players 2 --mode quick --games 2000 --seed 20261023 --bots greedy
```

The simulator uses only `src/game.js`, not the server or external APIs. It is a seeded **bot** benchmark, not real-player acceptance. The built-in production AI is different from the simulation bot. Use `--maps 128` (default) to sample 128 independent map templates or `--target N` to temporarily test a target without editing code. `SIM_JSON=out.json` exports structured results. Inspect `docs/BALANCE.md` for measurement limitations.

## Deploy to Render

The repository includes `render.yaml`. Production points to the existing GitHub `main` branch. **Do not replace the live game with development builds** until all v2 acceptance criteria pass. Render's free filesystem can disappear on restart; browser-host recovery is best-effort, not equivalent to persistent server storage. Permanent data storage requires a disk or database.

## Tests

`npm test` runs the complete Node+WebSocket test suite when `ws` is installed. To run the v2 logic-only subset: `node --test test/v2-*.test.js`. `node tools/qa_ui_browser.js` requires Playwright/Chromium and a live `ws`-capable server. The self-contained offline fallback is `python tools/stage7_browser_qa.py` (genuine Chromium, original local artwork, simulated transport).

Known outstanding items: multiplayer/host-restart acceptance, physical TV/iOS/Android testing, the WebSocket suite on the v2 build (three files blocked locally by missing `ws`), real network browser tests (the offline UI suite uses simulated state), audio-provider commercial licences, and production persistent storage. UI fonts use Georgia/system-ui, with no downloaded font files to license.

## Release notes & credits

- `CHANGELOG.md` — version-level history.
- `docs/history/` — all archived original phase and QA release notes.
- `docs/BALANCE.md` — quantitative balance evidence; `docs/history/V2-STAGE-5.md` — archived Stage 5 changes.
- `AUDIO-LICENCES.md` — Mirelo/Sonilo recording provenance and commercial usage caution.

## Stage 9 release preflight and Stage 7–8 evidence

`npm run release:preflight` now checks seeded balance evidence, audio SHA-256 hashes, portraits, fixture screenshots, installed `ws`, and reports manual acceptance blockers. **A non-zero exit is expected until release criteria actually pass.** Full local Node regression evidence: 148/148 dependency-free checks passed; three WebSocket-dependent test files remain blocked locally. The separate GitHub/Render preflight branch is based on v1.12.1 plus selected fixes, not this full v2 source. See `docs/STAGE9-RELEASE-READINESS.md`.

### Stage 7 baseline and Stage 8 checkpoint

Advanced four-player fairness now passes **4/4** prescribed checks on 2,000 seeded games, with 128 map templates (seed `20261102`). The Advanced-only final Gold Ledger cap has been calibrated from four to five Prestige, preserving Quick and Standard scoring. Early wins 44.20%, winners at ≥80% target 91.50%, Prestige ties 2.75%, seats 24.43–25.75%. This establishes a reproducible greedy-bot balance result, **not** real-player acceptance. Original Gold-hoarding behaviour still warrants human observation. See `docs/BALANCE.md` and `docs/STAGE7-RELEASE-READINESS.md`.

The TV and phone handbooks now display all 12/22/24 targets and their correct mode-specific Royal Ledger rules. Stale inactive rooms expire without disconnecting active participants, with a bound of 128 hosted rooms. The rematch lobby consistently prepares three action slots. New regression checks cover these changes. Live WebSocket/physical-device acceptance remains outstanding.

### Stage 8 review

The Stage 8 build corrects a capacity-policy bypass when a previously encrypted host recovery snapshot is restored after server restart; ordinary room creation and browser recovery now share one tested admission policy. Malformed HTTP URLs return a 400 error rather than escaping the request handler, and the required WebSocket package has been raised to `ws` 8.22.0 or later. Offline tests verify these code paths, but **the full WebSocket test suite could not be run on this machine because the npm package could not be downloaded**. An internet-enabled CI run must install the dependency and verify transport behaviour.

The `docs/STAGE8-RELEASE-READINESS.md` report records test results and outstanding gates. Real iPhone Safari, Android Chrome, overscan television and remote-house testing remains necessary. Audio licences must be confirmed against the connected provider accounts. No final approval, merge or live Render deployment is implied.
