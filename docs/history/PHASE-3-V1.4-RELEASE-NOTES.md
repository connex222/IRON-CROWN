# Iron Crown — Phase 3 character gallery, v1.4.0

## Release scope

- Redesigned the phone tycoon selection into **eight compact premium portrait cards** with separate large `Choose` and `View dossier` controls. Tycoons already claimed in the room remain viewable but cannot be selected.
- Added an interactive, private **Tycoon Dossier** for every character, including background, their exact Advanced-mode perk, all three era previews, and mood variants. The dossier describes the costume direction from the design bible; it does not claim that those outfits are separately painted yet.
- Added a new **Meet the Tycoons** gallery on the TV. It is accessible from the upper menu while the lobby is visible and during play, displaying all eight human portraits, their roles and Advanced abilities, and an interactive Steam / Iron / Electric preview.
- Added keyboard Escape closing to the phone dossier and TV modal, and accessible pressed states to the era/mood toggles. Fixed the initial phone dossier focus/scroll so it opens at the beginning, rather than at the bottom.
- Preserved the existing premium logo, railway country, authoritative mechanics, room codes, phone controls and all prior artwork.

## Exact caveats

The nine filenames per tycoon still contain distinct render **treatments of the eight original human portraits** — not nine independently acted expressions / fully redressed outfits per character. A truthful label in the gallery explains this. Production of 72 truly independent character frames remains for subsequent work.

Live WebSocket sessions, QR scanning and multiplayer gameplay across real devices have not been tested in this environment. `ws` remains the only Node runtime dependency, installed with `npm install` on the deployment target.

## Verification

- Automated Node checks: `npm test`.
- Headless Chromium behavioural QA: `python tools/phase3_v14_browser_qa.py` — opens and closes the gallery and dossier, checks 8 characters, taken/unavailable state, and switches both era and mood previews with zero JS runtime exceptions. The screenshots use **real bundled human master portraits** inserted as data URLs in a network-isolated preview; this does not establish actual network-based image delivery.
- No gameplay scoring, balancing or engine rules changed in this release.

## Next task

Produce genuinely different expression/era artwork (72 frames, subject identity consistency across nine frames each), then finish remote multiplayer and on-phone acceptance testing before release approval.
