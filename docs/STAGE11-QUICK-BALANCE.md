# IRON CROWN Stage 11 — Quick four-player fairness correction
**Build:** 2.0.0-dev.11 (GitHub review branch only)  
**Date:** 24 October 2026  
**Status:** Automated calibration passed; not production-certified.

## Rule and rationale

Quick's **12-Prestige target and eight-round limit remain unchanged**. In games with **four or more players**, reaching 12 before round eight is a Crown claim, not an immediate win, unless the leader's Prestige advantage over the next player is **at least 9**. If no player qualifies before the eighth Reveal, the winner is determined normally at the scheduled end, including the existing Royal Ledger payout and tie-break order. Quick with **two or three players** is unchanged; Standard and Advanced are unchanged.

This is a meaningful gameplay change, not just a tuning constant: it prevents an early 12-Prestige railway sprint from ending a contested larger match. The TV and phone instructions must explain it, and human games must evaluate whether nine points feels too demanding.

## Full seeded calibration

| Scenario | Seed | Games | Early Crown | Winner ≥80% of 12 | First-place Prestige ties | Win % by seat | Result |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| **Baseline Quick 4p, original trigger** | 20261117 | 2,000 | **66.25%** | 94.80% | 3.60% | 23.90–26.05% | **FAIL early-win gate** |
| **Stage 11 Quick 4p, nine-point lead** | 20261129 | 2,000 | **36.90%** | 93.75% | 3.80% | 23.77/25.72/25.30/25.20% | **4/4 PASS** |
| **Independent Stage 11 Quick 4p** | 20261201 | 2,000 | **37.65%** | 93.95% | 4.00% | 24.55/24.55/25.30/25.60% | **4/4 PASS** |
| **Quick 2p, unchanged same-seed rerun** | 20261103 | 2,000 | **48.95%** | 78.85% | 4.05% | 48.73/51.28% | **Identical to prior benchmark** |

The four-player criteria were 30–50% early victories, at least 90% winner-score consistency, ties below 8%, and 20–30% wins per seat. The 80%-score gate specifically applies to four-player (and eight-player) calibration; the two-player 78.85% result is an observation, not a failure under that rule.

Each 2,000-game set reused 128 independently generated map templates; it does **not** represent 2,000 independent maps. Both new four-player samples used the greedy benchmark bot with different random seeds, not human players and not the production AI. Their game simulations were independent samples, not one-to-one matched game trajectories. The 2-player sample used the same seed and data as the original to prove no behavioural regression.

Both four-player runs passed despite different seeds. Stage 11 median winning Prestige was 15; modelled income and planning timer duration was about 5.34–5.35 minutes, excluding host discussion, Reveal animation and real-world delays.

## Reproduction

```sh
SIM_JSON=docs/stage11-run/quick4-2000-margin9.json node tools/simulate.js --mode quick --players 4 --games 2000 --seed 20261129 --maps 128 --bots greedy
SIM_JSON=docs/stage11-run/quick4-2000-independent.json node tools/simulate.js --mode quick --players 4 --games 2000 --seed 20261201 --maps 128 --bots greedy
REQUIRE_BALANCE_PASS=1 node tools/evaluate_balance.js docs/stage11-run/quick4-2000-margin9.json docs/stage11-run/quick4-2000-independent.json
```

## Remaining risks

- The nine-Prestige early lead condition is unusual and should be judged for **fun**, player confidence and easy explanation at the November games-night trial. It remains a candidate until actual humans approve its feel.
- Eight-player Quick has not undergone equivalent Stage 11 seeded acceptance: the four-or-more-player rule is provisional for five to eight seats.
- Two- and three-player Quick follow the previous rule; the exact two-player baseline has been reproduced but a separate three-player simulation is outstanding.
- Staging WebSocket acceptance, physical TV overscan, iPhone/Android controls, hosting recovery, licensing and rollback remain mandatory prior to promotion to GitHub `main` or Render production.

**Production release: NOT APPROVED.**
