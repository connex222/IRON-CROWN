# Iron Crown — Phase 3 first integration, v1.2.0

## Integrated
- Approved new gold/brass premium Iron Crown logo used on both TV and phone.
- TV title/lobby rebuilt as an operable premium railway parlour, not a static mock-up. All joining, QR, AI and mode controls retain their functional IDs.
- Cinematic Victorian rail terminal scenic artwork, extracted without its baked-in mock-up buttons.
- Eight approved photorealistic human characters take over the avatar picker, TV roster, TV parade, phone identity, trade proposals, Reveal reaction overlays and final scores.
- All 72 original avatar filenames retained for three eras and neutral/smug/furious presentation. Eight transparent approved master portraits added.
- Human character names, identity labels, short character descriptions and Advanced perks appear in the selection flow.
- Clap-of-the-crown and clash result art is driven from the server's authoritative public feed (winner/participants), not randomly fabricated in UI.
- Nonvisual architecture, saved games and game rule engine unchanged.

## Quality checks
- `npm test`: 18/18 (offline Node tests)
- Inline JS extracted from both HTML documents: `node --check` passes.
- 72 phase-appropriate character portrait assets: all present, PNG headers validated.
- `ws` dependency unavailable in the offline build environment. Networked multiplayer acceptance not claimed.
- Chromium browser screen-capture could not complete in this environment, so real-device visual QA remains outstanding.

## Deliberate limitation
The 72 files use portrait-preserving lighting, colour and framing variants. Facial expressions and changing era-specific outfits are not yet independently illustrated for all eight identities; those art assets still need dedicated production to fully meet the bible.

## Deployment
Upgrade by replacing the files with this release and running `npm install`, `npm test`, then `npm start`. See README and render.yaml for Render hosting.
