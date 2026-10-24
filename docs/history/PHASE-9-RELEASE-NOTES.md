# Iron Crown Phase 9 — Encrypted Host Recovery (v1.12.0)

## Purpose
The current Render Free service has an ephemeral filesystem. Its server-side .data/rooms.json file is not durable across restarts/redeployments. This release adds a *second recovery path* without upgrading services or making paid external accounts.

## What changed
- At every relevant state broadcast, the server seals the entire room as AES-256-GCM with 12-byte random IV, per-room derived key, authenticated room-code associated data, and a compressed JSON payload. It includes all private tickets and credentials, but the ciphertext is **only** sent to the connected host socket.
- The TV host browser stores only the encrypted snapshot in localStorage, under the room code. Private phones never receive the encrypted copy.
- After a server restart that loses the room, the original TV automatically presents its room code, host token and latest encrypted recovery copy. An invalid token, invalid authenticated envelope, expired (>30 days) state, mismatched room or malformed game fields is rejected.
- After restoration all human seats start disconnected, then regain their saved identities when they reconnect. The ongoing game's deadline is extended by at least two minutes to allow the host and phones to return.
- A deliberate "Start a new room" action clears the old encrypted copy only after confirmation.
- The original local atomic rooms.json fallback remains unchanged. No external SDKs, runtime media, gameplay rules or purchases were added.

## Limitations and operational safety
- **Not durable hosting:** A game can still be lost if the host clears browsing data, uses private mode, switches browsers/devices or has not yet received a new snapshot. Local client storage may be limited or cleared automatically by the platform.
- A host who possesses the host token and a recovery copy controls the room; keep that TV browser private. This system is for small, trusted, invited games nights, not public matchmaking.
- Treat browser encryption as protection against accidental secret exposure in the host cache, **not** as a substitute for a hardened backend.
- A paid persistent Render disk or an external database remains the recommended long-term storage option; do not purchase either without approval.

## Test plan
The new tests exercise compression, confidential state encryption, tamper detection, wrong tokens, age limits, player state restoration, grace periods, and a real WebSocket server restart without a disk. The main CI runs on every push.

## Deployment
Render automatically deploys new main commits. Verify the exact release commit reaches status LIVE before claiming the hosted copy is updated. The /health endpoint still exposes installed audio count and version.
