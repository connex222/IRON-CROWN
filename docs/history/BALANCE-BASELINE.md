# Iron Crown v2 — Simulation baseline (original v1.12.1 rules)

This is the **beginning** of the proposed v2.0 design programme, not a final balance certification. The attached review is the design brief, and the unmodified v1.12.1 engine supplied in the ZIP was measured **before** applying the initial fairness changes. The simulator injects a deterministic map factory into the engine rather than using a server or client. Map templates are cached (32 maps per batch) to make repeated simulations affordable; their repetition is a limitation, not 2,000 independent random maps.

**Seed:** `20261023` — **Strategy:** first available greedily ranked City, Railway, Depot, recruit/trade/research; two planned orders under original rules. This is not the same bot as the review author's, so its estimates need not match theirs.

| Baseline sample | Games | Winner mean / median Prestige | Early-target endings | 1st/2nd Prestige ties | Win % by seat |
|---|---:|---:|---:|---:|---|
| 2 players · Quick | 80 | 7.24 / 7 | 16.25% | 12.50% | 53.75 / 46.25 |
| 4 players · Standard | 150 | 9.03 / 9 | 1.33% | 12.67% | 21.33 / 23.33 / 28.00 / 27.33 |
| 8 players · Standard | 80 | 8.19 / 8 | 0.00% | 12.50% | 18.75 / 13.75 / 13.75 / 12.50 / 12.50 / 8.75 / 8.75 / 11.25 |

The original **4-player Standard target of 15** is rarely met in this sample. Railways are insufficiently influential and tie frequency is uncomfortably high, corroborating the review's direction. The seat samples are **too small** to establish the required ±5/±4 percentage-point fairness targets.

### Reproduce locally

The `tools/simulate.js` harness has CLI options:

```
npm run sim -- --players 4 --mode standard --games 2000 --seed 20261023 --bots greedy
npm run sim -- --players 8 --mode quick --games 2000 --seed 20261023 --bots mixed
```

You can set `SIM_JSON=/path/to/output.json` to write machine-readable metrics. The CLI prints winner mean/median Prestige, early targets, Prestige ties, seat win rates, winner score sources, claimed routes, completed tickets, unspent resources and a timer-derived lower-bound duration. The programme runs only the authoritative engine; browser/WS networking is not exercised by it. Larger 2,000-game balanced samples and full `docs/BALANCE.md` target selection must follow the B1–B4 rule changes.

### Rollout sequence

1. Completed locally in this checkpoint: C1 simulation framework and baseline samples.
2. Initial A1–A5 corrections staged locally: accessible/non-exclusive town-independent tracks, exclusive physical segments, soldier-supported build clashes and refunds, tie rerolls/stalemate and shared final Crown, random snake placement/first Reveal seat.
3. **Not yet complete:** A6 simultaneous market, B1 three actions, B2 route Prestige, B3 new era routes, B4 Hills, C2 greedy production AI, B5 target tuning, 2,000-game fairness acceptance, Part E UI and Part F production housekeeping.

**Do not deploy this interim engine without aligning both UI clients and finishing v2 tests.**

## First post-fix smoke sample (A1–A5 only)

Using the same 150 four-player Standard games/seed/greedy-bot strategy against the **partially updated** engine:

| Measure | Original v1.12.1 | Staged A1–A5 |
|---|---:|---:|
| Winner mean / median Prestige | 9.03 / 9 | **10.00 / 10** |
| Early Prestige-target endings | 1.33% | 1.33% |
| First-place Prestige ties | 12.67% | **7.33%** |
| Mean routes claimed | 6.31 | **11.19** |
| Mean tickets completed by winner | 1.11 | **1.55** |
| Seat win percentages | 21.33 / 23.33 / 28.00 / 27.33 | 20.67 / 27.33 / 30.67 / 21.33 |

**Interpretation:** Relaxed track access and exclusivity more than doubled the practical number of rail opportunities. The original instant-win target remains largely unreachable; the requested railway Prestige and three actions per round are therefore not optional cosmetic changes. Samples are too small to validate statistical fairness, and improved bots may change the values. The future 2,000-game suite and production greedy AI should be built and run after the core changes.
