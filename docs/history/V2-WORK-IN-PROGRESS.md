# Iron Crown v2.0.0 — First engineering checkpoint

**Branch policy:** This zip is an isolated development copy. The public v1.12.1 GitHub main/Render game has **not** been replaced by this incomplete v2 source.

## Delivered in this checkpoint

- `tools/simulate.js` — seeded headless engine simulations and metrics, a `npm run sim` command. Three initial baseline samples and an A1–A5 comparison are included.
- `src/game.js` — optional map generator for isolated simulation, without changing normal `startGame` callers.
- **A1** — track starts from owned or adjacent route-path tiles, or extends from a previously built owned route; town ownership is no longer necessary.
- **A2** — route segments are exclusive between players, including revalidation when the action resolves. Segments already belonging to the player do not cost additional Timber or Steel.
- **A3** — soldiers supporting an adjacent free-tile Depot build add strength. Losing builders recover the entire paid resource cost and receive +1 Gold; a winning build has a defending Soldier.
- **A4** — tied claimants reroll up to three times and then stalemate. Defender wins an equal top score. Final results compare Prestige, Gold, unique rail sections and completed tickets, then declare a **shared Crown** for complete ties.
- **A5** — randomised start of snake placement and first Reveal priority, rotating on later rounds.
- New focused regression tests cover all the above. Existing tests updated only where they had hard-coded seat-first assumptions.

## Testing and limitations

- 93 of 93 locally runnable tests passed (nine existing/progression groups plus the two new v2 test files). Test groups requiring the `ws` module could not execute in this offline environment because the dependency was not installed; they remain **unverified against this checkpoint**, not failed.
- The attached reviewer simulated 2,000+ games. Our own independent first-pass baseline is 80/150/80 games for 2/4/8 seats, respectively, and post-fix comparison is 150 four-player games. These **do not** establish 2,000-game acceptance or statistical fairness.
- The shared TV and phone rulebook still explain the old v1.12.1 rules. **Do not deploy this interim build** until the three-actions, market window, complete v2 scoring and UI conversion have been finished together.

## Next tasks in the review's order

A6 shared market escrow; C2 production greedy AI; B1–B4 three orders, railway Prestige, era tracks and Hill income; B5 target tuning; 2,000-game D tests; E client presentation; F fonts/asset/doc housekeeping; then full CI, browser and real-device QA. Only after that should package.json graduate from `2.0.0-dev.1` to `2.0.0`.

## Stage 2 update — v2.0.0-dev.2

A6, C2, B1, B2 and B4 are now implemented together in the server engine and the TV/phone UI. All player trades enter one 20-second Exchange after the last Reveal action, with authoritatively held escrow and simultaneous answers. Production AI now ranks candidates rather than choosing randomly. Every player plans three actions in 40/45/45 seconds; Research stays once per round. Routes award direct 1/2/4/7 Prestige and Hills generate Gold from Iron onward. The TV shows the public Exchange participants and rail Prestige; phones show private offer details and action slots.

**The Prestige targets are intentionally not final.** Preliminary 4-player 150-game Standard simulations show early target wins in 92.67% of games with this partial rule set. B3 era bridges/electric routes must be added *before* B5 target tuning; no target changes have been deployed.

The local runnable Node tests passed (106/106); WebSocket-dependent tests were not runnable because the `ws` package is unavailable in this offline container. Live GitHub main and Render have NOT been updated. Read `docs/history/V2-STAGE-2.md` for complete measured results and outstanding tasks.
