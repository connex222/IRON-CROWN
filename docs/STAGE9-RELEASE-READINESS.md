# IRON CROWN v2 — Stage 9 pre-release follow-through

**Status: DEVELOPMENT — production release is not approved.**

## Basis and staging distinction

This local Stage 9 source is now `2.0.0-dev.9`, based on the Stage 8 candidate `2.0.0-dev.8`. Its Quick four-player seeded 2,000-game run failed the early-victory gate (66.25%, target 30–50%). The separate Render preflight service currently uses the earlier production v1.12.1 source with targeted hosting safeguards and **is not an uploaded or verified deployment of the Stage 8 ZIP**. The GitHub staging branch is `staging/iron-crown-preflight-20261023`; production `main` is intentionally unchanged.

## Balance calibration — exploratory, not certified

| Scenario | Games | Seed | Map templates | Early-victory rate | Winners reaching ≥80% of target | Notes |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Quick 4p target 12 | 48 | 20261117 | 48 | 68.75% | 97.92% | Current production rule |
| Quick 4p target 13 | 48 | 20261117 | 48 | 60.42% | 95.83% | Fails early-victory gate in this sample |
| Quick 4p target 14 | 48 | 20261117 | 48 | 50.00% | 85.42% | Fails ≥90% winner-score gate in this sample |

These target-sensitivity simulations mutate the *simulation-only* target. They do not modify the real game rules. Each 48-game sample is inadequate for release acceptance or confident causal estimation. Quick 2-player published target remains 12. Note that the target 14 sample was captured separately from the other two runs but with the same seed/maps/bot strategy.

**Balance decision:** no change to Quick's canonical 12-Prestige target in this build. A genuinely balanced intervention must be replayed with 2,000 games per principal scenario; paired 2-player baseline must also be checked, and mode instructions must reflect any approved rule change.

## Required final-release checks

- Full v2 source, unlike the v1.12.1 preflight branch, must first be transferred into isolated version control and deployed to non-production Render.
- Install the `ws` runtime there; execute all v2 Node tests, including genuine transport cases, with exact pass/fail counts.
- Test live mixed 2/4/8 seats, Exchange concurrency, reconnection, restart recovery, AI substitution, rematches and per-phone private information.
- Run 2,000-game seeded Quick 4p and Quick 2p after any adjustment, plus independent seeds for Advanced and other relevant scenarios.
- Verify audio reproduction on physical speakers and redistribution/commercial licences for every one of the 17 audio assets.
- Inspect actual iPhone Safari, Android Chrome, tablet and TV overscan before a production migration.
- Verify backups and rehearse rollback; browser recovery is best effort on ephemeral hosting.

**No production deployment should occur until these blockers pass.**

## Stage 9 automated release gate

The command `npm run release:preflight` now verifies recorded 2,000-game balance scenarios, locally installed WebSocket runtime, checksums for all 17 generated sound assets, presence of eight original portraits and 32 fixture screenshots. The command exits **1 intentionally** for any failed or blocked release criterion. It separately records unverified audio rights, physical devices and hosting recovery, so a completed unit test cannot be confused with production readiness.

A developer can preserve machine-readable results with:

```sh
RELEASE_PREFLIGHT_JSON=docs/stage9-run/release-preflight.json npm run release:preflight
```

On this local environment the result is **7 passes, 6 failed/blocked**, including the confirmed Quick 4p failure, incomplete Advanced 8p evidence, unavailable `ws` dependency and three manual acceptance categories. The presence of `ws 8.22.0` in staging CI applies to the **v1.12.1 preflight** branch, not yet this v2 release archive.

## Verified staging infrastructure (v1.12.1 preflight only)

On 23 October 2026, the isolated GitHub staging-branch workflow completed successfully: **106/106 tests passed**, including actual WebSocket connections, using installed `ws 8.22.0`, and all 17 audio files were inventoried. [GitHub Actions run 39997911453](https://github.com/connex222/IRON-CROWN/actions/runs/39997911453). Render confirmed the staging deployment of commit `d9b7bfb1616bae4eef6d350763b10027dab1c8b2` as `live`. The production deployment remains commit `1495778158237c66e3e114004acea8c7a0554dda` from 22 October 2026. **None of these results certify the local v2 build.**
