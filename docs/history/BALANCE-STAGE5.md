# IRON CROWN v2 — Stage 5 balance evaluation

**Game type:** authoritative engine simulated with seeded independent greedy bots, not real human players. **Build:** `2.0.0-dev.5`. `docs/stage4-run/` retains the earlier 6,000-game unmodified v2 Stage 4 baseline; `docs/stage5-run/` contains the current Stage 5 simulations and screenshots.

## Why Stage 4 failed

Standard at **20 Prestige** produced 57.20% early target victories (required 30–50%) and only 85.60% of winning bots scored at least 80% of the target (required ≥90%), over 2,000 games. Increasing only the target would make the second gap worse. The game also left ~29 total resources per bot unspent.

## Stage 5 changes

- Standard target **22**; Quick remains 12, Advanced remains 22 until its own 2,000-game target validation.
- Royal Ledger only at the scheduled final round: +1 Prestige per 8 unused industrial resources, capped at +3, and +1 per 4 Gold, capped at +3. Industrial goods means Coal, Timber, Grain and Steel combined. There is no early-game stockpile scoring.
- Grand Station selected by competent bots when already owning a City rather than universally selecting Directors.
- Simulation now uses **128 independently generated map templates**, up from 32, and 2,000 seeded full games for the full Standard four-player run. The same map template is reused in later games; do **not** claim 2,000 independent maps.

## Main Standard acceptance — 2,000 games

| Metric | Requirement | Stage 4 (20 target) | Stage 5 (22 target) |
| --- | --- | ---: | ---: |
| Early victories | 30–50% | 57.20% **FAIL** | **45.75% PASS** |
| Winner reaches ≥80% target | ≥90% | 85.60% **FAIL** | **93.45% PASS** |
| Prestige ties | <8% | 2.75% PASS | **2.80% PASS** |
| Seat win rates | 20–30% for each seat | 23.40–27.35% PASS | **24.05–25.75% PASS** |
| Median winner Prestige | Context | 20 | **23** |

Stage 5 four-player seat shares: **25.75% / 25.35% / 24.05% / 24.85%**. Winner's mean Prestige **23.28**. Winning score sources: Rail **11.06**, tickets **4.23**, final Royal Ledger **2.39**, Cities **1.84**, Longest Railway **1.62**, Grand Station **0.77**, Town Depots **0.71** and Largest Army **0.67**. Mean routes claimed **11.08**. Railroad chartering remains the largest scoring component.

A 260-game standard target-22 sweep *without* the new Ledger returned **45.77% early wins but only 70.38%** meeting the winner threshold. A 360-game sweep *with* the Ledger returned **47.50%** and **91.94%**. These pilots corroborate the full result but cannot replace it.


## Eight-player Standard acceptance — 2,000 games (separate seed)

With **128 independently generated map templates**, seed `20261025`, target 22 and the revised Royal Ledger, the eight-player Standard simulation produced:

| Metric | Requirement | Stage 4 (20 target) | Stage 5 (22 target) |
| --- | --- | ---: | ---: |
| Early victories | Context (30–50% is specified for four-player) | 54.55% | **42.95%** |
| Winner reaches ≥80% target | Context (≥90% gate is specified for four-player) | 83.85% | **95.30%** |
| Prestige ties | Under 8% | 4.10% | **4.00% PASS** |
| Seat win share | 8.5–16.5% each | 11.65–13.75% PASS | **11.35–13.10% PASS** |

Seat shares in joining order: **13.00 / 12.10 / 13.10 / 12.25 / 12.80 / 13.00 / 12.40 / 11.35%**. Stage 5 Standard-mode acceptance now passes both the four-player and eight-player 2,000-game evaluations. **This does not certify Advanced mode**: larger Advanced samples still fail the early-victory target.

## Other modes — provisional samples

| Mode | Players | Games | Target | Early victories | Winner reaches ≥80% target | Prestige ties | Status |
|---|---:|---:|---:|---:|---:|---:|---|
| Quick | 2 | 500 | 12 | 50.0% | 79.2% | 4.2% | Two-player pacing remains a concern; review's 90% gate is scoped to four-player modes |
| Advanced | 4 | 280 | 22 | 48.93% | 91.43% | 2.5% | Small favourable pilot; no certification |
| Advanced | 4 | 500 | 22 | 58.0% | 90.8% | 3.0% | **Early-win target fails** |
| Advanced | 4 | 400 | 23 | 52.25% | 89.5% | 3.25% | **Both acceptance targets fail** |

Advanced scoring needs an independent balance decision and larger seed/map samples. Moving the goalpost or declaring a universal v2 release based on Standard mode alone would be inaccurate.

## Reproduce

```bash
npm run sim -- --players 4 --mode standard --games 2000 --maps 128 --seed 20261023 --bots greedy
npm run sim -- --players 8 --mode standard --games 2000 --maps 128 --seed 20261025 --bots greedy
npm run sim -- --players 4 --mode advanced --games 500 --maps 128 --seed 20261026 --bots greedy
npm run sim -- --players 4 --mode advanced --games 400 --maps 128 --seed 20261026 --bots greedy --target 23
```

`SIM_JSON=out.json` exports exact results. Check `tools/evaluate_balance.js` for pass/fail criteria. Each seed is deterministic for that version's engine but the bots are not a substitute for humans. Simulator minutes ignore real conversations, TV animation, network delays and sound.
