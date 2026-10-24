# IRON CROWN — Stage 7 engineering and release-readiness report

**Version:** `2.0.0-dev.7` (isolated source ZIP, not approved for production)
**Date:** 23 October 2026
**Deployment:** No GitHub `main` merge or live Render deployment performed. The original v1 game must remain untouched until explicit release approval.

## Work performed

- Reviewed the supplied complete Stage 6 repository and its authoritative v2 design bible, release reports and prior seeded results.
- Corrected outdated **TV and phone How to Play** thresholds (12 Quick / 22 Standard / 24 Advanced), and brought all current handbooks into line with the Advanced-only final Gold Ledger cap.
- Ran a **2,000-game** baseline Advanced four-player acceptance sample, identified the specific 89.35% result below the ≥90% winner-score threshold, changed only Advanced final Gold Ledger's cap from four to five and reran the *same* 2,000 seed/map sample. The comparison achieved 91.50%, with 44.20% early wins, 2.75% ties, and 24.43–25.75% starting-seat shares. All four Advanced four-player balance gates now pass. Standard and Quick scoring logic has not changed.
- Ran **2,000 two-player Quick** games; 48.95% early wins, 48.73/51.28% seat share and 4.05% Prestige ties. The 78.85% winner-score consistency metric is observational, not the formally defined four-player gate. Average bot-timer estimate is 5.23 minutes, **excluding** cinematic animations and conversation.
- Added a finite **128-room hosting limit** and TTL cleanup (12-hour unattended lobbies; 24-hour abandoned finished rooms; 48-hour abandoned active games). Active connected sessions are never retired by this policy. Tracked activity timestamps for host/player presence and state-changing commands.
- Repaired the rematch-lobby reset to initialise three action slots, not two.
- Archived superseded development phase notes and root-level calibration artefacts under `docs/history/`; retained the current design bible, README, changelog, balance evidence and prior QA reports.
- Replaced the obsolete one-click `git push main` script with a review-branch-only push guard. Added `v2/**` and pull-request triggers to the test/visual QA workflows without altering the production branch.

## Evidence and test results

| Test | Result | Limitations |
| --- | --- | --- |
| Runnable Node/unit suites | **142 passed / 142 run** | Excludes three `ws`-dependent files that cannot load in the offline environment |
| Full `npm test` command | **142 passed / 145 discovered, 3 dependency-blocked files** | `phase7.test.js`, `phase8.test.js`, `phase9.test.js` report missing `ws` — **full suite not passing** |
| Chromium TV/phone fixture QA | **147 passed / 147 checks** | Five responsive widths (320/390/768/1280/1920) and 32 screenshots with locally shipped artwork served through Playwright asset routing; transport remains simulated, not live sockets |
| Primary gold buttons / touch / QR | **Included in the 147 checks** | CSS computed background, 56px primary phone target and join QR containment |
| Audio integrity | **17/17 SHA-256 and 17/17 FFprobe checks pass** | Does not prove headphones/speaker output or external provider licences |
| Approved portraits | **8/8 original `_human.png` files present** | Physical phone rendering and accessibility still need real devices |
| Standard 4-seat and 8-seat balance | **Previously accepted 2,000 games each** | Preserved Stage 5 benchmark, not independently re-run today |
| Advanced 4-seat balance | **2,000 games, 4/4 gates PASS** | Same-seed comparison; needs additional-seed and human validation |
| Quick 2-seat balance | **2,000 games** | 2-seat fairness/pacing described, not formally subject to 4-seat scoring gate |

## Remaining release blockers — prioritised

- [ ] **High:** Install the `ws` Node package in a network-enabled CI/working environment and pass **all** WebSocket unit/integration tests, including genuine server-host and phone reconnections, permissions, simultaneous trading and cross-house connections.
- [ ] **High:** Run true Playwright client-to-server tests with the running WebSocket server from lobby creation to match completion and rematch; do not treat state fixture rendering as equivalent.
- [ ] **High:** Test on actual iPhone Safari, Android Chrome, a large TV/overscan display and remote connections. Verify music, sound ducking and opt-in preferences on speakers.
- [ ] **High:** Confirm Mirelo and Sonilo's commercial-use and redistribution terms for the account and 17 generated audio recordings. The manifest proves integrity, **not licensing**.
- [ ] **High:** Establish a suitable restart-persistence policy for Render. Current local JSON persistence and encrypted host-browser recovery are **best-effort**, not a guarantee of durability on an ephemeral filesystem. No paid dependency or external database has been introduced.
- [ ] **Medium:** Extend balance checks to additional independent seeds, Advanced eight-player and four-player Quick, and mixed-skill human/AI scenarios. Advanced bots currently hoard large amounts of Gold.
- [ ] **Medium:** Verify WCAG AA contrast, focus order and screen readers across every action editor/modal; browser fixture smoke tests are not a complete accessibility audit.
- [ ] **Medium:** Perform actual end-to-end match duration, engagement, decision clarity and replayability observations at games night. **Passing 2,000 seeded games does not certify fun.**
- [ ] **Release:** When all critical/high gates pass and the user approves, prepare final `2.0.0` commit/tag, verify GitHub Actions, rehearse rollback and only then replace the live Render game.

## Commands

```
npm install --no-audit --no-fund
npm test
python tools/stage7_browser_qa.py
REQUIRE_BALANCE_PASS=1 node tools/evaluate_balance.js docs/stage7-run/advanced4-2000-gold5.json docs/stage5-run/standard-4p-2000.json docs/stage5-run/standard-8p-2000.json
```

The release ZIP must remain labelled **development** until the unresolved gates are actually cleared. The available ZIP is source and evidence for the next review stage, not a certified `2.0.0` release.
