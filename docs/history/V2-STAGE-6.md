# IRON CROWN v2 — Stage 6 (development checkpoint)

**Build:** `2.0.0-dev.6`. **Live GitHub/Render deployment is unchanged.**

## Work completed

- Increased Advanced-mode provisional victory target to 24 Prestige. Standard remains 22 and Quick remains 12.
- The final Royal Ledger awards at most 4 Prestige for Gold in Advanced only, rather than 3 in the other modes. As before, only the scheduled final round pays any reserve bonus.
- Updated help and original design bible mode targets.
- Added `test/v2-stage6-advanced.test.js` to prevent mode cross-contamination.
- Re-ran 133 tests locally, excluding the three `ws`-dependent legacy suites; all passed.

## Reproducible Advanced calibration

| Configuration | Games | Early victory | Winner >=80% target | Prestige ties | Seat win range |
| --- | ---: | ---: | ---: | ---: | ---: |
| Pilot target 24, old Gold cap | 180 | 41.67% | 88.33% | 2.22% | 23.33–26.67% |
| Target 24, Advanced-only fourth Gold Prestige | 120 | **45.83%** | **89.17%** | **4.17%** | **22.50–28.33%** |

**Neither pilot satisfies full acceptance.** The winning-score consistency gate is >=90% in a **2,000-game** seeded run, and the new 120-game pilot measured 89.17%. This requires additional tuning and statistical confirmation.

The existing Stage 5 Standard-mode 2,000-game results remain the basis of Standard acceptance; we did not alter Standard scoring or mode targets. The 300-game Advanced attempt did not finish within this environment's execution limit, so no result is claimed for it.

### Reproduce

```sh
SIM_JSON=advanced.json npm run sim -- --players 4 --mode advanced --games 2000 --maps 128 --seed 20261102 --bots greedy
REQUIRE_BALANCE_PASS=1 node tools/evaluate_balance.js advanced.json
npm install
npm test
```

## Release blockers

1. Advanced 2,000-game acceptance, including >=90% winner-score consistency.
2. Three WebSocket-dependent test suites remain unrun on this offline checkout (`ws` is unavailable in local npm cache).
3. Live network end-to-end QA and actual iOS/Android/TV sound/overscan acceptance.
4. Storage and licence review remain as documented in Stage 5.

**Do not deploy or merge this intermediate build to the live game.**
