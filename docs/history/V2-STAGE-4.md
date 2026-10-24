# IRON CROWN — Stage 4 Engineering Report

**Isolated build:** `2.0.0-dev.4`. **Live production:** `1.12.1` (unchanged; no GitHub `main` or Render deployment). Stage 4 continues from the Stage 3 code ZIP and follows the independent user-supplied review.

## Implemented

1. **Correct clash accounting after multiple rerolls.** Contestants eliminated in an earlier round of non-defender tie rerolls are now retained in the final payout, casualty and TV result settlement. Two new deterministic three-player tests reproduce the issue and demonstrate the repair.
2. **2,000-game starting-seat fairness checks.** Executed Quick two-player, Standard four-player and Standard eight-player simulated bot matches. Seat fairness and Prestige tie-rate gates now pass at four/eight players, but early-win and winner-threshold gates do not. No invented score change was applied merely to make metrics look good. See `BALANCE.md`.
3. **Acceptance gate evaluator.** Added `tools/evaluate_balance.js`, which checks sample size, reviewer seat-bias limits, four-player early wins, four-player 80%-target completion and first-place tie-rate. It can exit nonzero when `REQUIRE_BALANCE_PASS=1` for formal CI gating.
4. **Artwork cleanup.** Removed 72 unused era/mood PNG derivatives that the app no longer references, retaining the eight original approved, individually distinguishable human tycoon portraits. Updated two obsolete tests which previously required the retired 72-file set. The avatar directory shrank from about 25MB to about 8.5MB.
5. **Documentation consolidation.** Archived 15 superseded phase/QA reports under `docs/history/` and preserved the original design bible as `docs/history/01-iron-crown-v1-legacy.md`. Rewrote root README, introduced `CHANGELOG.md` and rebuilt `01-iron-crown.md` to document the actual 3-action, exclusive-rail, viaduct/Express, shared Exchange, scoring and tie rules.
6. **Regressions.** All 117 runnable Node tests pass locally after the modifications. Three WebSocket-dependent test files cannot execute because `ws` is not installed in this offline runtime; no claim is made for the full `npm test` suite. All 17 original sound recordings are retained.

## Known remaining requirements for v2.0.0

- Achieve **30–50% early target completion** and **≥90% of winners at ≥80% of target** in four-player 2,000-game greedy simulations. The current measured values are **57.20%** and **85.60%** respectively.
- Re-run with additional independent map templates, varied seeds and Advanced four-player samples.
- Install `ws` in a connected environment and run complete Node/WebSocket integration and Chromium browser QA including the new market and era routes on TV and phone.
- Real-device TV overscan, phone Safari/Chrome, audio mix, reconnection and game-night duration acceptance.
- Exact requested Playfair Display and Inter woff2 fonts and their licence texts are not bundled in this Stage 4 build; avoid representing that as completed.
- Product-level review of City incentives, unspent resources, Grand Station adoption and a 2-player mode-specific pacing concern.
- Source terms for commercial redistribution of the 17 generated recordings must be verified before selling.

**Promotion policy:** No `main` branch changes, no Render deployment and no final v2.0.0 tag until these acceptance requirements have been resolved or explicitly approved as release exceptions.
