# IRON CROWN v2 — Stage 12 release-readiness review

**Build:** 2.0.0-dev.12  
**Date:** 24 October 2026  
**Review branch:** `staging/iron-crown-stage12-resilience`  
**Production branch:** `main` unchanged.

## Verified work

1. **Quick eight-player balance.** Ran two real 2,000-game, independent-seed greedy-bot samples with the unchanged nine-point early-Crown requirement. Both met the eight-player 8.5–16.5% seat rate and under-8% Prestige tie rate. See the raw JSON evidence and `docs/BALANCE.md`.
2. **Authenticated eight-seat transport.** Live Node/`ws` tests create eight genuine TCP/WebSocket phone controllers, deny a ninth seat, reject invalid rejoin tokens, close superseded sign-ins, and keep public state free of private tokens.
3. **Hostility and failure handling.** A hostile browser Origin is denied with policy close 1008; an oversized frame receives 1009; the server continues accepting rooms. Backpressure tests prove a socket with more than 512 KiB queued will be terminated without serialising another state snapshot.
4. **Eight-seat process restart.** Tests persist all eight registered seats to a temporary local state file, restart the actual Node server, confirm all humans correctly become offline, then authenticate and reconnect all eight, preserving identities without exposing credentials.
5. **Existing media/UI.** Keep Stage 10 locally bundled 17 original, 17 mastered and nine bespoke tracks, plus the eight human portraits. CI tests still validate integrity and regressions.

## What this does not prove

The simulator uses independent greedy bots, not human opponents. The 128 maps are reused. A local process restart with a writable state file **does not verify Render's ephemeral-disk survival across a container replacement**. Live browser acceptance on real Android, iOS, PC/TV, multiple households and weak/interrupting networks remains scheduled for November. Commercial distribution rights for the generated recordings must be evidenced separately.

## Release gates

| Gate | Stage 12 result |
| --- | --- |
| Four-player Quick pacing and fairness | PASS in two earlier independent 2,000-game samples |
| Eight-player Quick seat equity and first-place ties | PASS in two new independent 2,000-game samples |
| Real server WebSocket regressions | PASS (see current GitHub Actions run) |
| Socket backpressure protection | PASS unit tests |
| All eight seats recover from local server restart | PASS integration test |
| Cross-network / real-device and human Quick enjoyment | BLOCKED — planned November acceptance |
| Render container replacement persistence and rollback | BLOCKED — no durable hosted storage proven |
| Commercial redistribution licences | BLOCKED — evidence still required |
| Production promotion | **NOT APPROVED** |

### Release decision

**Stage 12 engineering complete on its review branch; continue manual and hosting acceptance before production.** Do not merge to main or update the live Render service solely because CI passed.
