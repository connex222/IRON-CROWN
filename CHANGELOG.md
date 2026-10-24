## 2.0.0-dev.13 — Stage 13 underway: deploy verification and recovery hardening (24 October 2026)

- Released verified Stage 12 commit `376ba7cde0d6c8470749e64d8af1759344c874e2` to the separate Render service `iron-crown-stage12-preview`, with auto-deployment off. Production `main` and existing Render service remain unchanged.
- Created a separate Stage 13 development branch and live HTTPS/WSS acceptance workflow. The hosted test opens eight real WebSocket connections, rejects a ninth, checks public-state credentials are private, verifies all 26 original/bespoke audio files plus mastered audio, and checks TV/phone HTTP delivery.
- Introduced a **local-only** atomic room snapshot writer with mode-0600 files, a private previous-version backup and recovery from a corrupt primary snapshot. A server health field identifies local-file persistence as `host-persistence-unverified`, not durable cloud storage.
- Added snapshot corruption, permission and disabled-storage tests; extended the full Node/real-WebSocket regression suite.
- **Stage 13 is not yet production-ready:** No persistent Render disk or external database is configured. The November physical multi-household test, audio redistribution rights, rollback drill and durable hosted recovery remain blocked.

## 2.0.0-dev.12 — Stage 12 eight-player fairness and transport resilience (24 October 2026)

- Completed two independent 2,000-game **Quick eight-player** greedy-bot samples, each using 128 recycled map templates. Seat distribution 11.30–13.75% (seed 20261212) and 11.30–13.15% (seed 20261214), within the required 8.5–16.5% bounds; first-place ties 4.95% and 5.05%, below 8%. All four eight-player formal checks passed.
- Reported eight-player early victories of 31.85% and 31.30%, respectively, as **observational**: the 30–50% gate was specified for four-player scenarios only.
- Bound outgoing per-socket WebSocket buffers to 512 KiB, terminating stalled clients before serialising more game-state snapshots.
- Added real eight-human connection tests for lobby capacity, duplicate sign-in takeover, wrong-token rejection and cross-origin/oversized-message security; added an eight-seat server-restart persistence/rejoin test using a test-local state file.
- Preserved the Stage 11 nine-point Quick early-Crown lead and all existing 17 originals, 17 mastered sounds, nine bespoke recordings, and eight tycoon portraits.
- Does not certify persistence over Render redeploy/sleep, real phones/TVs or audio licensing; GitHub main/Render production remain unchanged.

## 2.0.0-dev.11 — Stage 11 Quick four-player pacing (24 October 2026)

- Revised the early-victory trigger for Quick with four or more players: 12 Prestige plus a **9-Prestige advantage** over second place. The match still ends at the planned eighth round if no early Crown is clinched.
- Preserved normal 12-Prestige early victories for two/three players, and unchanged Standard/Advanced targets and scoring. The scheduled Royal Ledger remains final-round only.
- Completed two independent **2,000-game four-player greedy-bot** calibrations (128 shared map templates in each set): 36.90% and 37.65% early victories; all eight applicable gate checks pass.
- Confirmed the **2,000-game two-player Quick** benchmark is exactly unchanged under the same seed and map templates.
- Added server-driven public lead requirement and contested Crown Gazette notification; updated TV, phone, rules, README, score evidence and release preflight.
- Added unit regressions and persistent independent-seed evidence; production remains untouched pending Quick eight-player, cross-network/physical-device and licence acceptance.

## 2.0.0-dev.10 — Stage 10 complete audio integration (24 October 2026)

- Transferred the full v2 source, server-authoritative game engine, responsive TV/phone UIs, tests, documentation and all approved eight portraits into a separate GitHub staging branch.
- Preserved 17 original MP3 recordings and shipped 17 locally mastered variants with verified checksums.
- Downloaded and decoded eight original Mirelo event sounds (railway switch, contract stamp, trading, Royal Ledger, Grand Station, ticket completion, invalid order and Electric era), plus the original 110-second Daydream instrumental score; all audio is served locally.
- Integrated nine optional sound keys with fallback to original recorded cues, event priorities, music/ambience ducking and independent opt-in TV and phone controls.
- Fixed stale two-action rematch assertions, removed unapproved/unused avatar variants from staging, retained seeded-balance JSON evidence and marked missing binary browser screenshots blocked rather than passing.
- Passed the **entire 177-test Node.js suite including actual WebSocket tests** with nine new recordings installed.
- **Not promoted to production:** Quick four-player fairness failure, physical-device checks, redistribution licences, cross-network acceptance and hosting durability remain open.

## 2.0.0-dev.9 — Stage 9 acceptance preflight (23 October 2026)

- Added executable release preflight with six deterministic recorded balance scenarios, SHA-256 inventory, portrait/screenshot inventory and explicit blocker flags.
- Re-ran local dependency-free Node checks: 148/148 passing; the `ws`-dependent test files still require network-enabled validation against full v2.
- Pilot-tested Quick four-player targets 12/13/14 in 48-game samples; kept authoritative Quick rules unchanged pending the mandatory larger balanced sample.
- Verified separate staging GitHub Actions passed 106/106 tests with `ws 8.22.0`, but this is v1.12.1 preflight code and not a v2 deployment.
- Protected existing live Render and GitHub `main` from premature promotion.

## 2.0.0-dev.8 — Stage 8 security and expanded acceptance (23 October 2026)

- Raised the minimum supported `ws` dependency to 8.22.0 (security maintenance). A fresh installation and actual WebSocket verification are still required in a network-enabled environment.
- Prevented encrypted browser room recovery from bypassing the existing 128-room capacity check; restored active sessions get a fresh activity timestamp.
- Handled malformed HTTP request URLs without uncaught URL parsing exceptions.
- Added dependency-free Stage 8 regression checks for host recovery, admission safeguards and HTTP error handling.
- Extended seeded balance evidence and release documentation; **no production deployment**.

## v2.0.0-dev.7 — Release hardening and help consistency

- Correct TV/phone handbook targets to the 12/22/24 values used by the engine, with accurate mode-specific Gold Ledger scoring.
- Fix rematch lobby initial action count to three slots.
- Add bounded room hosting and inactivity-based stale-room retirement while preserving connected sessions.
- Add new regression tests for the above and preserve the established eight portraits and 17 soundtrack assets.
- Advanced-only endgame Gold Ledger cap raised to 5 Prestige following paired 2,000-game seeded benchmarks: 89.35% to 91.50% of winners reaching 80% of the target; early wins remain 44.20%, all four Advanced fairness checks pass.
- Archive interim development notes and calibration artefacts. Deployment and release certification remain blocked by network and device acceptance, remaining scenario coverage and audio licence review.

## v2.0.0-dev.6 — Advanced balance calibration

- Provisional Advanced target 24, isolated from Quick and Standard targets.
- Final-round Advanced Royal Ledger allows a fourth Gold Prestige point after 16 Gold; all other modes remain unchanged.
- Two new targeted regression tests, 133 locally runnable tests passing.
- 120-game Advanced pilot remains slightly below winner consistency requirement; **not release-ready**.

# IRON CROWN — Release History

| Version | Highlights |
|---|---|
| 1.0–1.3 | Private TV/phone railway multiplayer, authoritative game engine, map, original tycoons and production UX foundations |
| 1.4–1.5 | Human-portrait gallery, character moods and era panels; original eight portraits established as the only active images |
| 1.6–1.7 | Advanced games and server engine refinements, rules/security regression tests |
| 1.8–1.8.2 | Local Mirelo/Sonilo audio pack, optional mixer and dramatic ducking |
| 1.9 | Reliable phone reconnection, accessible phone controls and first-round walkthrough |
| 1.10 | Host reconnect, safe AI takeovers, corrected rematches and full-room tests |
| 1.11 | Responsive multi-device How to Play, original kingdom lore, real-history timeline and opt-in phone sound |
| 1.12 | AES-encrypted browser-host backup on ephemeral hosting |
| 1.12.1 | Gold-button backgrounds restored, QR clipping corrected and automated visual QA |
| 2.0-dev.1 | Fair track laying, exclusive segments, build support, tie rerolls, variable snake placement and seeded simulator |
| 2.0-dev.2 | Three orders, one shared market, improved AI, railway Prestige, Hill income |
| 2.0-dev.3 | Three Iron lake viaducts, three Electric Capital expresses, provisional score targets, era UI and map stress tests |
| 2.0-dev.4 | Multi-claimant reroll payout fix, 2,000-game balance evaluation, elimination of 72 unused avatar derivatives, consolidated handbook and release notes |

| 2.0-dev.6 | Advanced provisional 24-point target and +4 Advanced Gold Ledger cap; requires balance verification |
| 2.0-dev.7 | Server room-lifecycle protections, reconciled TV/phone handbook, rematch slot correction and staging cleanup |

| 2.0-dev.5 | Standard four-player endgame scoring and target calibration (2,000 seeded games), measurable Grand Station AI utility, final Royal Ledger, shared Crown interface fixes, 128 map templates, new browser and regression tests |

**Version 2.0 is not yet released.** Historical phase notes are preserved under `docs/history`. Game balance and device acceptance evidence supersede aspirations in early phase announcements.

### Stage 9 pre-release evaluation (23 October 2026) — not a shipped v2 release
- Recorded preliminary 48-game Quick four-player target-sensitivity checks (12, 13 and 14 Prestige). No canonical scoring rules changed because neither proposed target is sufficiently validated.
- Documented the difference between the isolated Render staging preflight (v1.12.1 plus hosting safety) and the complete local v2.0 Stage 8 release candidate.
- Tracked the remaining v2 transport, balance, licensing and physical-device gates in `docs/STAGE9-RELEASE-READINESS.md`.
- Added an executable `npm run release:preflight` gate and two regression tests, requiring complete balance evidence and independent reporting of unaudited external acceptance blockers. The expected non-zero result prevents an accidental declaration of production readiness.
