# Iron Crown — Phase 2 Release Notes (v1.1.0)

## Delivered

- Illustrated 37-hex country with unique SVG art for all 8 tile types.
- Stronger rail route variety, station coverage, and seeded procedural reproducibility.
- Visually distinct completed/unbuilt/blocked routes, coloured rails, animated income locomotives.
- Clear depot flags, soldier counters, City silhouettes, and three-era board lighting.
- TV map zoom controls, town-label toggle, map legend, terrain and railway inspectors.
- Action-focus camera motion during Reveal; respects reduced-motion preferences for animations.
- Mobile target picker with matching country palette, dashed legal-target borders, route touch areas, and text-list fallback.

## QA

- 16/16 Node automated tests pass (`npm test`).
- Standalone browser checks: 37 terrain hexes, 18 railways, zoom, label toggle, tile/route inspectors, mobile target legality and route legality; no client-side errors in synthetic-state tests.
- 100 distinct deterministic map seeds proved Capital connectivity and ticket endpoint validity; 25 seeds reproduced exactly.

## Outstanding

- Full WebSocket/multi-phone acceptance testing on an installed runtime is still required. The offline build environment cannot fetch npm's `ws` dependency; install via `npm install` with network access or Render.
- Real living-room TV and low-end phone performance, accessibility auditing, and balancing over human matches are still outstanding.
- Requested Playfair Display/Inter woff2 fonts are not bundled in this version; local offline system font fallbacks remain.

## Rules and compatibility

No gameplay rules or saved data formats were changed; TV and phone still use the existing server messages. The original `01-iron-crown.md` remains authoritative.
