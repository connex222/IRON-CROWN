# Iron Crown v1.11.0 — Cross-Device Clarity, Sound and Lore

**Goal:** Make the existing game pleasant to use on a wide television, a desktop PC, a tablet or a phone, without changing the underlying railway rules.

## Improvements delivered

- Prominent always-visible "? How to Play" action on shared TV/PC and controller, a 60-second lobby starter and a separate History & Lore button.
- Four accessible in-game handbook chapters: start, all seven actions and costs, fictional kingdom lore and a short historically researched Victorian railway timeline.
- Victorian backstory for the royal succession, all three eras and all eight existing tycoons, explicitly labelled fiction. Historical notes distinguish the Liverpool-Manchester opening in 1830, the Bessemer process in 1856 and electric-light/telegraph milestones.
- Responsive TV/PC toolbar, map/roster layout, lobby and handbook with 1600+, 1050 and 720 px breakpoints; easier touch navigation at narrow widths.
- Mobile/private controller reflows at 365/500 px, tablet/PC controller at 820 px, user zoom no longer disabled; large readable instructions and four chapter navigation controls.
- Distinct opt-in controller sounds: local UI selection, confirmation and dice-roll MP3 cues. The TV already plays the original 17 local Mirelo/Sonilo recordings and offers Quiet/Balanced/Cinematic mix profiles. No runtime audio CDNs.
- Improve light-mode parchment accent contrast to over 5:1 for common text pairings, with dark mode preserved.

## Verification

- The original 90 tests continued to pass after the UI edits and a corrected script quotation.
- Eight new static/syntax/UX/audio/contrast checks added; GitHub Actions must pass 98/98 before release is considered verified.
- The live Render build is automatically deployed from main; deployment of this exact new commit must be checked separately.
- Full WCAG AA audit, real hardware and speaker testing remain outstanding.

## References

See HOW-TO-PLAY-AND-LORE.md for the complete handbook, seven action costs, rules, era lore, character vignette notes, and historical source URLs. The existing design bible 01-iron-crown.md remains authoritative.
