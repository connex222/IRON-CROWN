# IRON CROWN v2 — Authoritative balance evidence (Stage 11)

**Build:** `2.0.0-dev.11` — **not a production release**. These are seeded matches between the independent greedy simulation bots and the actual game-logic engine. They are **not** human-playtest results, full-stack multiplayer verification or proof of enjoyable pacing. Every 2,000-game evaluation below used **128 independently generated map templates** reused throughout its 2,000 matches; therefore 2,000 matches does **not** mean 2,000 different maps. The Production AI is distinct from the benchmark bots.

## Current accepted seeded scenarios

| Scenario | Seed | Games | Prestige target | Early victories | Winner reaches ≥80% target | Prestige ties | Seat wins | Acceptance |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Quick, 2 players | 20261103 | 2,000 | 12 | 48.95% | 78.85% | 4.05% | 48.73% / 51.28% | **Pacing evidence only; review's 90% score gate is for four-player matches** |
| **Quick, 4 players — Stage 11** | **20261129** | **2,000** | **12 + 9-point early lead** | **36.90% — PASS** | **93.75%** | **3.80%** | **23.77–25.72% per seat** | **All four checks pass; confirmed separately with seed 20261201** |
| Standard, 4 players | 20261023 | 2,000 | 22 | 45.75% | 93.45% | 2.80% | 25.75% / 25.35% / 24.05% / 24.85% | **All four applicable gates pass** |
| Standard, 8 players | 20261025 | 2,000 | 22 | 42.95% | 95.30% | 4.00% | 13.00–11.35% per seat | **All applicable gates pass** |
| Advanced, 4 players | 20261102 | 2,000 | 24 | 44.20% | 91.50% | 2.75% | 24.43% / 24.80% / 25.75% / 25.02% | **All four applicable gates pass** |

**Fairness gates:** four-player early wins 30–50%; four-player winners ≥80% target in at least 90%; ties under 8%; four-player seats within 20–30%; eight-player seats within 8.5–16.5%. The independent review did not prescribe the four-player 90%-score gate for two-player Quick. Eight-player figures are interpreted under the separately stipulated ±4-point fairness band.

The Quick bot benchmark has **average winner Prestige 12.14** and an estimated **5.23 minutes** of planning-and-income timer time. This estimate excludes actual TV Reveal animation, conversation, trading pauses and interruptions; it is *not* the likely wall-clock length of a real Quick match. The 78.85% winning-score metric merits observation at the November games-night test even though it is not an explicit two-player failure gate.

## Stage 11 correction — two independent 2,000-game four-player benchmarks

The Stage 8 failure remains in the record below. Stage 11 retained Quick's 12-Prestige target and added a **nine-Prestige lead requirement for an early Crown with four or more players**. All four acceptance checks passed with seed 20261129 (36.90% early, 93.75% 80%-score, 3.80% ties, 23.77–25.72% seats) and an independent seed 20261201 (37.65% early, 93.95% 80%-score, 4.00% ties, 24.55–25.60% seats). Each sample ran 2,000 games with 128 generated templates, reused across matches. The identical-seed Quick two-player rerun reproduces all previously reported summary metrics. These are **greedy-bot** results, not a prediction of human enjoyment. See `docs/STAGE11-QUICK-BALANCE.md` and `docs/stage11-run/`.

## Stage 8 Quick four-player finding — full 2,000-game benchmark

A new independent seeded sample of **2,000 Quick four-player games** (seed `20261117`, 128 reused map templates, greedy benchmark bots) produced an **early-victory rate of 66.25%**, exceeding the stipulated **30–50%** gate. The winner-score consistency criterion passes at **94.80%**, first-place ties are **3.60%**, and seat-win shares range from **23.90% to 26.05%**. This is a **formal 1/4 acceptance failure** (3 pass, 1 fail), not a numerical fluke to erase from the release checklist.

The original Quick **12 Prestige** target has **not** been changed without validating the impact on two-player Quick pacing and consistency with the design bible, the TV/phone handbook and spectator UI. The earlier two-player Quick 2,000-game sample had 48.95% early victories. An across-the-board target increase could fix four-player pacing at the expense of the two-player experience. A possible player-count-adjusted Quick target would change the authored rules, and therefore requires a documented specification amendment, paired two/four-player 2,000-game validations and updated UI instructions before use. The existing release build retains the original target with a candid blocker.

The simulator's 4.83-minute estimated Quick four-player time includes only modelled income and planning clocks. It excludes Reveal, Exchange discussion, player thought and physical display animations, and is **not** a verified wall-clock games-night duration. This failure does not imply starting-seat unfairness; the measured seat rates passed independently.

Evidence: `docs/stage8-run/quick-4p-2000.json`, `docs/stage8-run/quick-4p-2000.log`. Replay with:

```sh
SIM_JSON=docs/stage8-run/quick-4p-2000.json node tools/simulate.js --players 4 --mode quick --games 2000 --maps 128 --seed 20261117 --bots greedy
REQUIRE_BALANCE_PASS=1 node tools/evaluate_balance.js docs/stage8-run/quick-4p-2000.json
```

The second command **must exit non-zero** until the Quick four-player early-win failure is addressed. An Advanced eight-player exploratory sample was not completed within the execution window and is not claimed as evidence.

## Paired Advanced calibration — exact same 2,000 games/seed/maps

| Measure | Stage 6, Gold Ledger maximum 4 | Stage 7, Advanced Gold maximum 5 |
| --- | ---: | ---: |
| Games | 2,000 | 2,000 |
| Seed / map templates | 20261102 / 128 | 20261102 / 128 |
| Early victories | 44.20% | **44.20%** |
| Winners scoring ≥80% of 24 Prestige | 89.35% — **FAIL** | **91.50% — PASS** |
| Prestige ties | 3.35% | **2.75%** |
| Four-player seat-win range | 24.43–25.70% | **24.43–25.75%** |
| Mean winner Prestige | 24.81 | 25.32 |
| Mean winning Royal Ledger Prestige | 3.01 | 3.52 |

This change adds only an additional eligible **final-round Advanced Gold Ledger point**, subject to having at least 20 Gold; Quick and Standard remain capped at 3 Gold Ledger points. Advanced industrial stockpile Prestige remains capped at 3. It cannot create an early victory because the Royal Ledger is paid only at the scheduled final round. The resulting four-player Advanced sample meets every stated statistical gate. The matched seed is a reproducible *controlled comparison*, **not** an independent validation seed; repeating with additional seeds is advisable before publishing a definitive balance claim.

A significant quality concern remains: the Stage 7 Advanced winner has **56.10 Gold** on average and players leave **38.41 total resources per person** unspent; rail routes provide **12.46 points** of the **25.32** mean winning Prestige. This suggests sizeable economic slack and possible route-dominant bot play. A statistical pass alone does not demonstrate meaningful strategic choices or fun for humans. Do not increase the hoarding reward further without human-play evidence.

## Files and reproducibility

```
SIM_JSON=docs/stage7-run/advanced4-2000-gold5.json node tools/simulate.js --players 4 --mode advanced --games 2000 --maps 128 --seed 20261102 --bots greedy
SIM_JSON=docs/stage7-run/quick2-2000.json node tools/simulate.js --players 2 --mode quick --games 2000 --maps 128 --seed 20261103 --bots greedy
REQUIRE_BALANCE_PASS=1 node tools/evaluate_balance.js docs/stage7-run/advanced4-2000-gold5.json docs/stage5-run/standard-4p-2000.json docs/stage5-run/standard-8p-2000.json
```

The preserved unmodified Stage 6 2,000-game comparison is `docs/stage7-run/advanced4-2000-baseline.json`; the current tuned scenario is `docs/stage7-run/advanced4-2000-gold5.json`. Stage 5 Standard's accepted results remain in `docs/stage5-run/`. The prior balance report and historic failures are in `docs/history/BALANCE-STAGE5.md`. **These results belong to different build versions for the unchanged Standard modes**; they are not a fresh whole-build rerun of every mode. No claim is made about Advanced 8-player, Quick 4-player, mixed-skill bots or real multiplayer fairness.
