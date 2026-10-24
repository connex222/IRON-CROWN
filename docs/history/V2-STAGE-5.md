# IRON CROWN — Stage 5 engineering and release-gate report

**Build:** `2.0.0-dev.5`, isolated development package. **Live GitHub main and Render remain on the released v1.12.1 game.** This work continues the user's independent v2 design review without changing multiplayer authentication, room recovery, portraits or the 17 bundled sound recordings.

## Implemented

1. **Royal Ledger:** when the game reaches its *scheduled final round*, all players earn endgame Prestige for surplus industrial freight and Gold. The freight bonus is 1 Prestige per 8 unused Coal/Timber/Grain/Steel (maximum 3); the Gold bonus is 1 Prestige per 4 Gold (maximum 3). Royal Ledger pays at most 6, is not awarded when a game ends before its round limit, and is computed exactly once by the authoritative server. No client can submit its own points. It adds an endgame objective to excess stocks without accelerating early victories and makes railway-generated Gold meaningful to the end.
2. **Standard target retuning:** raised the development target from 20 to **22** Prestige. This was based on target-sweep evidence; the old target generated too many early wins, whereas raising the target alone left too many underscoring winners.
3. **Grand Station AI:** previously the AI and the independent simulation bot always picked Directors when holding two tickets (nearly everyone), which made Grand Station irrelevant. They now prefer Grand Station if they own a City, then Directors if they have tickets, otherwise Telegraph. Grand Station contributes measurable winning Prestige in current calibration.
4. **Bot reproducibility:** simulation CLI now accepts `--maps` (default 128 independently generated map templates, previously 32) and `--target` for a temporary, explicitly recorded target sweep. The target override is restored on exit. The summary includes a winner-resource breakdown and the new Royal Ledger Prestige source.
5. **Final winner UI:** TV final standings now show Royal Ledger points and correctly announce multiple shared Crown winners, not just the first tied player. The phone recognises shared champions.
6. **Cross-device browser QA:** Chromium renders synthetic authoritative-state fixtures for three-action planning, simultaneous Exchange offers and final scoring at 320, 390, 768, 1280 and 1920 px. This browser test **mocks the WebSocket transport** and does not substitute for a full end-to-end network test. No background images loaded through external HTTP; screenshots may show stand-in portraits due the offline browser navigation restriction.

## Test honesty

- All **131 locally runnable Node tests passed**. `npm test` reports 134 entries: 131 pass and three WebSocket-dependent test files fail to load because `ws` is unavailable in this offline container. These are unexecuted dependency-blocked test files, not claimed passing cases; they are mandatory before release.
- **95/95** Chromium layout and phase checks passed, with 32 screenshots. Network was simulated; physical TVs, real browsers and speaker audio were not tested.
- Initial 360 Standard four-player and 280 Advanced four-player calibrations were followed by **2,000 Standard four-player and 2,000 Standard eight-player simulations**; see `docs/BALANCE.md` for the full measured result and other mode samples.
- Both the 2,000-game Standard four-player and 2,000-game Standard eight-player release-gate evaluations pass. Advanced four-player samples remain outside the required early-win band and need further balancing. A small pilot is not evidence of universal balance.

## Remaining blockers to v2.0.0 release

1. Full WebSocket/integration and real-end-to-end Playwright runs on a machine with `npm install` network access.
2. The **2,000-game eight-player Standard balance now passes**; Advanced target and Quick two-player pacing remain open and require further tuning. The Stage 4 evidence remains available as prior baseline, not v2 Stage 5 certification.
3. Actual remote-house games using iPhone Safari, Android Chrome, TV overscan and real sound output; measured WCAG AA contrast and screen-reader audit.
4. Exact Playfair Display/Inter font bundling and legal review of redistributed audio are not completed. No unrelated binary font files were inserted into this development archive.
5. Render Free has ephemeral disk; encrypted TV-host snapshots are best-effort only. Persistent storage needs a separate decision.

**Deployment policy:** leave production GitHub `main` and Render untouched until gates are met or the user explicitly approves documented exceptions.
