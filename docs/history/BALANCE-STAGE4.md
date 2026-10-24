# IRON CROWN v2 — Stage 4 Balance and Fairness Evidence

**Build:** `2.0.0-dev.4` (isolated; NOT released). **Test methodology:** 6,000 seeded, server-authoritative *greedy-bot* game simulations with seed `20261023`, using `tools/simulate.js`, plus optional shorter target sweeps. All three full 2,000-game result JSON files and console logs are retained in `docs/stage4-run/`. These are not human game-night results.

## Six thousand game results

| Mode | Players | Simulations | Target | Winner mean / median | Early target % | Winner ≥80% of target | First-place Prestige ties | Seat win shares |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Quick | 2 | 2,000 | 12 | 11.19 / 12 | 45.45% | 69.75% | 4.00% | 52.28 / 47.73% |
| Standard | 4 | 2,000 | 20 | 19.85 / 20 | 57.20% | 85.60% | 2.75% | 25.20 / 27.35 / 23.40 / 24.05% |
| Standard | 8 | 2,000 | 20 | 19.37 / 20 | 54.55% | 83.85% | 4.10% | 11.65 / 13.75 / 12.15 / 12.70 / 12.85 / 12.25 / 11.95 / 12.70% |

The half-percent rounding in shared crown scoring may produce a seat sum within 0.01 percentage points of 100%, not exactly 100%. Each sample uses the same independent seeded greedy strategy and rotates avatar assignments, so seat and Advanced perk effects are not permanently confounded.

## Reviewer acceptance criteria — explicitly scored

| Review criterion | Full-run result | Pass? |
|---|---|---|
| Four-player starting-seat win probability within **±5 percentage points** of 25% | 23.4–27.35% | **PASS** |
| Eight-player starting-seat win probability within **±4 percentage points** of 12.5% | 11.65–13.75% | **PASS** |
| Four-player target wins before final round in **30–50%** of games | 57.20% Standard | **FAIL** |
| Four-player winner reaches **≥80% of target in ≥90%** of games | 85.60% Standard | **FAIL** |
| First-place Prestige ties **under 8%** | 2.75% Standard four; 4.10% Standard eight; 4.00% Quick two | **PASS** |
| At least **2,000 games each** in 4- and 8-player fairness cases | 2,000 + 2,000 + 2,000 two-player | **PASS** |

**Five of seven operational gate evaluations pass; two explicitly fail.** Do not claim v2 balance is certified, and do not promote the provisional Standard Prestige target of 20 as final. The proposed target 19 in a preliminary 180-game sweep triggered early victories in 61.67% of games, also outside the target band. This small sweep is not sufficient to certify an alternative threshold.

## Further gameplay findings

- **Four-player winning Prestige composition:** rail 10.38, tickets 4.76, city 1.70, unupgraded Town Depots 0.71, Longest Railway 1.66, Largest Army 0.62 and Grand Station 0.00. Rail is now the strategy's centre but City/Grand Station play is still not as valuable as a strong overall game should allow.
- **Eight-player winning Prestige composition:** rail 11.48, tickets 4.19, city 1.23, Town Depot 0.37, Longest Railway 1.55, Army 0.56 and Grand Station 0.00. Mean completed routes: 14.47 across the game; two-player mean: 3.02.
- **Unused economy:** 28.94 unspent resources per player on average in four-player Standard, 21.74 in eight-player Standard and 9.33 in two-player Quick. AI and network accessibility still have opportunities to turn stock into meaningful late-game decisions.
- **Two-player caveat:** Quick passes the Prestige tie target and appears to have fair seat shares, but only 69.75% of winners clear 80% of its 12-Prestige target. That 90% constraint in the independent review was specifically written for four-player games, yet two-player pacing remains a usability concern.
- **Map sampling limitation:** `tools/simulate.js` creates **32 seeded map templates and reuses them** for all 2,000 matches. The simulations provide substantial randomized move/seat/tycoon samples but should not be presented as 2,000 unique generated maps. The separate Stage 3 stress test generated 1,500 different maps and verified 4,500 viaducts. To validate generality, future simulations should increase the template count and vary seeds.
- **Approximate duration:** the engine-only simulator excludes actual player deliberation, network reconnection, animations and real-TV sound; its timer-based 5–9 minute estimates **are not game-night durations**.

## Correctness defect repaired in Stage 4

The fair non-defender tie-reroll handler could narrow the `contestants` array to its reroll finalists, unintentionally excluding previously eliminated claimants from refund, casualties and gazette results. Now **all contestants remain in settlement** while only finalists reroll; regression tests validate both multi-reroll refund and ordinary elimination. This is a genuine gameplay fix, not a cosmetic adjustment. It does not materially change the broad 2,000-game seat-share interpretation.

## Decision and next balance work

**Preserve Quick 12, Standard 20 and Advanced 22 as development defaults only.** Do not manipulate the scores or bypass gates to obtain a passing release badge. For Stage 5: increase meaningful uses for late-game resources and Town/City development without making rail Prestige incidental; tune planning AI and possibly objectives; re-simulate at multiple target levels with ≥2,000 games and more independent generated maps; include Advanced mode; and keep the agreed thresholds fixed unless evidence supports a justified revision.

## Reproducing the evidence

```bash
npm run sim -- --players 2 --mode quick --games 2000 --seed 20261023 --bots greedy
npm run sim -- --players 4 --mode standard --games 2000 --seed 20261023 --bots greedy
npm run sim -- --players 8 --mode standard --games 2000 --seed 20261023 --bots greedy
node tools/evaluate_balance.js docs/stage4-run/*2000.json
REQUIRE_BALANCE_PASS=1 node tools/evaluate_balance.js docs/stage4-run/*2000.json
```

`REQUIRE_BALANCE_PASS=1` exits non-zero while any acceptance criterion fails. All results are real output from the supplied game code, not fabricated targets or estimates. Real human playtesting and full WebSocket acceptance are still required.
