# IRON CROWN — Stage 2 Engineering Release

**Version:** `2.0.0-dev.2` — development ZIP only; **not deployed**.
**Source:** Independent design/build review supplied alongside the original v1.12.1 ZIP. Stage 1 changes are retained.

## Completed in this stage

| Review task | Code changes |
|---|---|
| A6 | One shared 20-second Exchange after Reveal. Offers have IDs, escrow, independent replies, deterministic order-based settlement, refund on decline/insufficient recipient funds, optional forced Ezra trade; AI recipients answer automatically. TV shows public participants/status only; phones see only incoming terms. |
| C2 | Server production AI now scores legal city upgrades, route/ticket opportunities, nearby Market Towns and missing resources, with conditional attack/recruit/research/bank trade. Draws shortest tickets, favours Navvies/Express/Directors, and selects resource-diverse placement nearest a Market Town. All actions still pass ordinary `setAction` validation and budget checks. |
| B1 | Three independent action slots, three Reveals per player, Telegraph slot 3 support, once-per-round Research still enforced. Plan clocks: Quick 40s; Standard/Advanced 45s. Private phone UI and tutorial updated. |
| B2 | Each owned railway route now awards direct Prestige: lengths 2/3/4/5 = 1/2/4/7. Longest Railway trophy is a separate `longest` field (+2) and is displayed separately on phones; TV roster shows rail points. |
| B4 | Hills yield +1 Gold from the Iron era, or 2 Gold during Advanced Gold Rush (without stacking). Hill-source attack bonus was already implemented in Stage 1. Help copy revised. |

No `ws` runtime dependency changes and no external CDNs. Existing room/tokens, broadcast secrecy, host recovery, 17 recorded audio cues and 8 approved human avatars are retained.

## Simulation results — provisional, same seeded independent greedy harness

Seed `20261023`; game lengths vary by early targets. These samples reflect **B1/B2/B4 without the still-pending B3 extra era routes**. Because the simulation harness has its own greedy strategy, the data do not directly measure the production AI.

| Sample | Games | Winner mean / median Prestige | Early win by target | Prestige ties | Seat win % | Mean routes |
|---|---:|---|---:|---:|---|---:|
| Quick · 2 players | 120 | 10.21 / 10 | 55.83% | 2.50% | 54.17 / 45.83 | 2.51 |
| Standard · 4 players | 150 | 16.71 / 16 | 92.67% | 0.67% | 28.00 / 26.67 / 28.00 / 17.33 | 7.76 |
| Standard · 8 players | 12 | 16 / 16 (median; tiny sample) | 91.67% | 0% | 8.33 / 16.67 / 16.67 / 8.33 / 16.67 / 8.33 / 25 / 0 | Not separately reported |

**Interpretation:** Route Prestige is powerful, but the previous Standard target of 15 is now far too low (early win in 93% of this sample). Quick also triggers earlier than the requested 30–50% range. Do not declare balance success; targets need tuning after B3. Four-/eight-seat samples are much too small to certify fairness (requested 2,000 seeded games), and win percentage variations should not be treated as conclusions. The 90-game eight-seat attempt exceeded the available time limit; the small 12-game smoke test completed successfully.

Raw reproducible JSON/text samples are included as `stage2-quick-2p.*`, `stage2-standard-4p.*` and `stage2-standard-8p.*`. Run `npm run sim -- --players 4 --mode standard --games 2000 --seed 20261023 --bots greedy` when adequate compute time is available.

## Tests and acceptance

- **106 of 106 locally runnable tests passed** (`node --test` explicitly enumerating all non-WS files).
- 16 Stage 2 focused tests validate market escrow, privacy, timed settlement, AI trade restraint, three slots, route score and Hills.
- Chromium and physical multiplayer acceptance remain to be re-run after all v2 client changes; the full `npm test` includes WebSocket groups that cannot run here without installing `ws`.

## Not finished

**B3:** generate 3 bridge/3 Electric routes, era gating, UI reveal. **B5:** re-tune Quick/Standard/Advanced Prestige targets using large simulations after B3. **D:** 2,000-game fairness/seat-bias acceptance. **E:** complete era-route presentation (current UI handles markets and three slots). **F:** retired-asset removal, font packaging, document consolidation, design bible and final version 2.0.0. No production upload from this development checkpoint.
