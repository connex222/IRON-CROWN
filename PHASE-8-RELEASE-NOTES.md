# IRON CROWN — Phase 8 · Game-Night Readiness (v1.10.0)

## Implemented

### Authoritative TV host recovery
The shared TV keeps its last room code and token. It shows a persistent reconnect banner until the server acknowledges that the saved room is valid, then restores the display. Failed connections back off rather than producing reconnection storms. A lost room or invalid host token stops automatic recovery and offers a confirmable Start a new room control. A momentary network interruption cannot silently replace the original games-night room.

### Host controls and absent-player readiness
AI takeover, lobby player removal, and rematches all require explicit confirmation. TV start controls identify humans who have not reconnected. Both the TV and authoritative server prevent starting a match with disconnected human players unless the host changes their seats to AI. Removing a player after the match starts is prohibited; explicit AI takeover detaches the player's socket and informs their phone. Repeated takeover is rejected. An already-bound WebSocket cannot switch identity to create another seat or host room.

### Rematch repair
Fixed an actual defect: a rematch previously continued broadcasting the retired finished-game state instead of the new lobby. After Play again the server now broadcasts the fresh lobby, preserving the same invited player names, character selections and authenticated seat tokens. Scores, resources, tickets, upgrades, drafts, orders, bonuses and character mood are all reset.

### Deploy verification
The public non-sensitive /health endpoint now reports game version, number of rooms and how many of the 17 bundled local sound files are installed. The existing /audio/manifest.json continues listing only local media; no third-party audio streams or new runtime dependencies have been introduced.

### Expanded live integration acceptance
Ten Phase 8 tests cover TV host logic, safe controls, socket identity, rematches, health, and live rooms with 2, 4 and 8 WebSocket players; authentication tokens and hidden destination tickets are checked for privacy. Another live test covers host recovery, invalid tokens and role switching. A restored completed-room test validates rematch and start-with-absent-humans rejection.

The design bible's game rules, victory targets and art assets are unchanged.

## Remaining real-world acceptance
Physical phones on Android and iOS, an actual TV, Render deployment verification, inter-home play, sound mix on speakers, measured WCAG AA contrast and licensed commercial distribution review are still outstanding. These are not certified by automated tests.
