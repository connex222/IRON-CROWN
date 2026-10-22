# IRON CROWN — Phase 7: Game-night accessibility and network reliability (v1.9.0)

## Delivered

1. **Reliable saved-seat recovery.** The private phone controller does not claim reconnection succeeded until the server has accepted its saved player ID and token. It opens only one active socket, backs off failed attempts, clears invalid credentials for deliberate rejoining, and stops automatic recovery when the host removes the player.
2. **Detect dead Wi-Fi connections.** A 30-second server-side WebSocket ping/pong heartbeat closes nonresponsive connections and updates connected status. Repeated joins with the same valid token do not incorrectly mark the active seat disconnected.
3. **Interactive first-round guide.** Three optional tips explain selecting action slots, choosing an action, and reviewing resources before sealing orders. Players can advance or hide the guide. It disappears after the opening round.
4. **More accessible controls.** Resource stepper buttons and legal target rows have 56 px minimum tap heights. Accessible labels and selected states are exposed to assistive technology; highlighted legal map targets respond to Enter or Space.
5. **Dialog keyboard support.** Rulebook and character dossiers have Escape-to-close, Tab focus cycling and focus restoration. Reconnect status and error notices announce via live regions.
6. **Less disruptive vibration.** Phone vibrates once on arrival of each new trade offer, not every time the authoritative game state repeats.

## Verification

- **78/78 automated tests passed** in GitHub Actions, with zero failures.
- Includes a genuine WebSocket host + phone integration case: disconnect, reconnect with the same token, rejoin the same socket again, confirm one seat/connected status, and reject invalid credentials.
- Existing engine, audio, map, and interface regression tests continued to pass.
- No new runtime dependencies, rule changes or external media requests.

## Remaining acceptance requirements

- Real-life TV plus multiple mobile devices on Render, including Android and iOS reconnect tests.
- Full measured WCAG AA colour-contrast review across both light/dark modes and every in-game screen.
- Completion of bespoke portraits for era costumes and facial expressions.
- Longer real-player balance testing with 2–8 players.

This is a reliable Phase 7 engineering release, not a claim that the product has completed all real-world acceptance tests.
