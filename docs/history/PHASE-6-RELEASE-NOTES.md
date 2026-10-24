# IRON CROWN — Phase 6 (v1.8.0)

## Completed

- Animated income locomotives with steam trails travelling claimed railway lines.
- Dedicated Steam/Iron/Electric era-reveal overlay and era-specific light treatment.
- Route/tile action spotlight and impact flash for construction, clashes, trophies and victory.
- Clash stand-off with real human portraits and the server-supplied dice results (never invented rolls).
- Locally discoverable optional audio assets, served by the same Node.js server with no additional runtime dependencies.
- Sound-on user gesture, separate effects/music volume, ambient railway and rhythmic locomotive loops when files are installed.
- Procedural, synthesised fallback effects and music when no media is supplied; game is fully playable without recordings.
- Accessible screen-reader announcements, reduced-motion support and persistent TV mixing preferences.
- Exact 17-cue sourcing manifest and commercial licence ledger.

## Testing

- `npm test`: **59/59** passed (all 53 previous engine/rules tests plus 6 Phase 6 audio/structure tests).
- Headless Chromium Phase 6: train/smoke display, Iron-era curtain, real clash dice, settings sliders, reduced-motion toggle and sound activation passed; **zero uncaught browser errors**.
- Phase 3 avatar QA, Phase 4 private planning QA and Phase 5 ticket QA re-ran successfully.
- `node --check` applied to new and modified server modules and inline TV JavaScript; passed.

## Unfinished

- Professional audio recordings have deliberately **not** been bundled; source licensed assets and drop them into `public/audio/`.
- Fully bespoke 72 era/mood character portraits remain separate Phase 3 art work.
- Live multi-device testing, volume checks on actual TV speakers, and Render deployment confirmation are outstanding.

Original gameplay rules, scoring, resources, eras and multiplayer protocol remain unchanged.
