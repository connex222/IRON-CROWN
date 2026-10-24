# IRON CROWN — Stage 13 hosted preview and November game-night acceptance

**Date:** 24 October 2026  
**Stage 12 preview:** https://iron-crown-stage12-preview.onrender.com  
**Stage 13 source:** `staging/iron-crown-stage13-readiness`  
**Live production:** https://iron-crown-vtjr.onrender.com — **not changed**.

## Deployment identity and safety

The Stage 12 preview runs pinned GitHub commit `376ba7cde0d6c8470749e64d8af1759344c874e2` and reports `2.0.0-dev.12` from `/health`. Render auto-deploy is **off**. Do not give participants the old production URL when asking them to test v2; do not merge Stage 12 or Stage 13 into `main` without explicitly accepting release blockers.

Stage 13 source is a **new, unpromoted review branch**. Its new local snapshot store is not running on the Stage 12 preview.

## Automated tests

1. `npm test` uses the real game and WebSocket server on local ephemeral test sockets.
2. `node tools/hosted-smoke.js` opens genuine WSS connections to the hosted Stage 12 preview, verifying host creation, eight named human seats, ninth-seat rejection, private-token isolation, 26 local original/bespoke audio manifest entries, both client HTML endpoints and mastered audio HEAD responses.
3. Stage 11 Quick four-player fairness and Stage 12 Quick eight-player fairness acceptance evidence remain separately checked in CI.
4. `test/v2-stage13-snapshot-store.test.js` validates local file permissions, backup recovery and invalid local snapshots.

A successful automated pass is not a guarantee that multiple households, real phones, real TV audio or human game pacing work.

## November practical test checklist

| Test | How to test | Pass condition |
| --- | --- | --- |
| Independent household hosts | TV/PC host in household A; phones in household B and C | All clients can join using QR/code without Wi-Fi sharing |
| Eight real devices | Mix iPhone, Android, tablet and PC browsers if available | All eight invited players join with the correct avatars, readable private cards and zero duplicated seats |
| Seat takeover | Refresh an active phone; rejoin with stored credentials | Original controller is closed; private hand and seat ownership are preserved |
| Connectivity interruption | Disable Wi-Fi/flight-mode one phone for 30–90 seconds, then restore | Host shows offline state and the same player reconnects |
| Host refresh | Refresh the shared TV browser mid-match | Same room and private players survive a supported host rejoin |
| Interrupted host process | Graceful server restart on a *persistent local test file* | Room and eight seat identities restore; game can continue after reconnect |
| Render replacement | Recreate/replace Render instance under a **configured persistent store** | Room survives without relying solely on a host browser backup; otherwise mark FAIL |
| UI accessibility | TV at 1080p/4K with overscan and PC/phone landscape/portrait | QR, How to Play, money, action buttons and timers remain readable |
| Audio | Test effects/music on TV speakers, phone, headphones, Bluetooth | Intelligible cues without clipping, abrupt loops, unwanted autoplay or accessibility issues |
| Quick pacing/fun | Run multiple four- and eight-player matches | Human players understand nine-Prestige early lead and want to rematch |
| Rematch | Finish game, rematch with the same friends | IDs/avatars retained, all private and public scoring and actions reset |
| Security | Attempt cross-room credentials and expired backup | No private token exposure and no unauthorised seat takeover |

Record device/browser versions, room size, cross-household topology, reproducible symptoms, screenshots, and actual elapsed game durations. Avoid publishing real join tokens or stored browser recovery payloads.

## Remaining production gate — durable hosting

The source currently writes `.data/rooms.json` on the server unless `STATE_FILE` is set. Local state files and backups do not survive replacement of an **ephemeral Render instance**; no durable Render disk/database is present on the preview. Host-browser encrypted recovery is a fallback rather than a substitute. Before production migration, select and configure a persistent store (e.g. an attached persistent disk on an eligible Render service, or an authenticated external store) and run a verified replacement/failover drill. Never claim that the Stage 13 backup copy fixes ephemeral hosting.

## Audio rights

Nine bespoke recordings were generated with Mirelo/Daydream and are now bundled in GitHub. Production approval still requires documentary confirmation of the provider terms, commercial distribution/redistribution rights, provenance for the 17 prior recordings and any required attribution. No legal approval is implied by a successful decoding or integrity test.

## Release decision

**Production: BLOCKED** until durable hosting, multi-household acceptance and audio rights are evidenced. Stage 13 is a development milestone, not a production declaration.
