# IRON CROWN — Phase 5 · Railway Empire (v1.7.0)

## Implemented

- **Private Destination Ticket progress:** The authoritative game engine calculates which tickets are completed from routes actually owned by the player. The phone's confidential contracts page displays progress and the current reward (including the Board of Directors bonus). Opponents and the TV see only the resulting numeric Prestige breakdown, not completed secret ticket identifiers.
- **Longest Railway fairness:** A connected railway network's physical hex-to-hex track segments are counted only once, even if two claimed routes overlap. The Longest Railway trophy remains exclusive and is removed on tied totals.
- **Advanced Market Crash:** The global event's 4:1 bank exchange rate overrides Corn Exchange and Mrs Pennyworth's resource discount for that one round. These discounts return when the event ends.
- **Verified railway progression:** Tickets, purchase of additional era upgrades via Research, the free Steam/Iron/Electric drafts, Grand Station awards, Board of Directors, Largest Army, Royal Visit, Quick/Standard/Advanced rules, events and endgame tie-break were exercised with dedicated automated tests.
- **Mobile presentation:** Accessible private ticket-progress summary and current effective Prestige reward labels. The private view now supplies progress directly from the game engine, rather than trusting the client's own approximation.

## Quality gates

- `npm test`: **53/53** passing (39 existing tests + 14 additional Phase 5 tests).
- `python tools/phase5_browser_qa.py`: passed in headless Chromium; finished and unfinished cards render correctly, no uncaught JavaScript errors.
- `node --check src/game.js` and `node --check src/map.js`: passed.

## Scope and limitations

The game bible remains authoritative. This release fixes incorrect score reporting and clarifies the global Market Crash precedence, without changing the three-era schedule, ticket values, ability catalogue, victory targets or other game mechanics. Full live multi-device and Render acceptance testing remain outstanding. Independent art for all era outfits/expressions is still pending.
