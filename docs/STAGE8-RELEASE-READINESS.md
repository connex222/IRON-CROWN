# IRON CROWN v2 — Stage 8 security, QA and release report

**Build:** `2.0.0-dev.8`, 23 October 2026. **STATUS: DEVELOPMENT ONLY — DO NOT REPLACE LIVE RENDER.**

## Changes implemented

1. **Host capacity / restore safety.** Encrypted browser recovery was previously a separate room-creation path that did not check the `MAX_ROOMS` limit. Both fresh rooms and recovered snapshots now sweep stale rooms and pass the same `assertCapacity` guard. A restored room is marked active before admission. Automated regression checks cover 127 accepted / 128 rejected rooms, and ensure that both server branches call the guard.
2. **Malformed HTTP request URLs.** An invalid URL now returns HTTP 400 from the request handler rather than causing an uncaught exception; regression checks verify the handler.
3. **WebSocket package security.** The declared minimum supported `ws` version is raised from `^8.18.3` to `^8.22.0`. Older versions below 8.21.0 have reported resource-consumption vulnerabilities. This is a **manifest update, not a verified local installation**; CI must install the package and pass transport tests before release.
4. **Retained assets/rules.** No existing approved portrait, licensed audio file or established game scoring rule has been removed or changed. No production service or GitHub `main` branch was modified.

## Stage 8 evidence (local environment)

| Gate | Observed result | Certification status |
|---|---|---|
| Local dependency-free Node/unit checks | 146/146 passed after Stage 8 changes | Pass — does not include real WebSocket tests |
| Chromium fixture rendering checks | 147/147 passed; 32 screenshots from TV/phone viewport scenarios | Pass for fixture UI, not real controller/server traffic |
| `npm test` including WebSocket tests | **Unavailable: `ws` cannot be downloaded**; three `ws`-dependent test files cannot load | **Blocked; not passed** |
| Audio file SHA-256 inventory | 17 of 17 correct | Pass for bytes; not proof of speaker audio or rights |
| Original approved human portraits | 8 of 8 present | Pass for asset presence; not actual phone rendering |
| Standard 4/8-player and Advanced 4-player seeded balance | Previous Stage 5/7 2,000-game passes preserved; no scoring changes | Previous evidence retained, not a Stage 8 rerun |
| Quick four-player new seed | **2,000 matches** (seed 20261117): 66.25% early wins, 94.8% winner-score consistency, 3.6% Prestige ties, seats 23.90–26.05% | **FAILED 1/4 gates: early wins exceed 50%** |
| Advanced eight-player new seed | Attempt exceeded local execution window | **Not completed** |

## Outstanding blockers in priority order

- [ ] **HIGH** — Install `ws@8.22.0` or later in a network-enabled environment, run and pass `npm test` with no blocked test files, and run the real-browser/real-server `node tools/qa_ui_browser.js` workflow with screenshots.
- [ ] **HIGH** — Genuine WebSocket end-to-end acceptance: room creation; two, four and eight human seats; AI substitution; authenticated disconnect/rejoin; several simultaneous trades; complete game/rematch; privacy; invalid/forged actions; restart persistence and cross-network participation.
- [ ] **HIGH** — Physical-device acceptance: iPhone Safari, Android Chrome, PC, TV overscan, accessibility and audio in actual speakers. Simulated fixture screenshots are not a substitute.
- [ ] **HIGH** — Verify providers' commercial use and redistribution licences for all 17 Sonilo/Mirelo recordings; checksums alone do not establish permissions.
- [ ] **HIGH** — Approve/implement hosting durability strategy. Render ephemeral storage plus encrypted host-browser recovery remains best effort. Avoid assuming that a server restart can always restore a game.
- [ ] **BALANCE** — Investigate the **confirmed** Quick four-player 2,000-game failure (66.25% early wins), then validate any proposed adjustment against the existing two-player Quick experience before changing published mode rules. Validate Advanced eight-player and additional independent Advanced four-player seeds.
- [ ] **RELEASE** — Update GitHub review branch, obtain passing GitHub Actions, rehearse rollback, receive explicit approval to replace production and verify the live health endpoint, phones and audio afterwards.

## Safe local / CI execution

```sh
npm install --ignore-scripts --no-audit --no-fund
npm test
node tools/qa_ui_browser.js
node tools/evaluate_balance.js docs/stage7-run/advanced4-2000-gold5.json docs/stage5-run/standard-4p-2000.json docs/stage5-run/standard-8p-2000.json
```

To run logic-only tests without `ws`, use the exact test file selection described in `README.md`. **Do not count that subset as the full 149-check suite**.

**Recommendation:** Do not release as `2.0.0` until transport, device, licence and balance blockers have documented passes. Retain the existing live game unchanged.
