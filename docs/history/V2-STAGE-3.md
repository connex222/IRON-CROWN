# IRON CROWN — Stage 3 Engineering Release

**Version:** `2.0.0-dev.3` (isolated development build; **NOT deployed**).

## Completed

1. **Iron-era bridges (B3):** Map generator preserves the original 18 Steam routes, then selects three additional *unique* Lake-crossing viaducts, one across each separated Lake. It can extend a bridge approach to nearby land to avoid duplicate endpoints. Railway paths remain contiguous and each new route has 2–4 segments.
2. **Electric-era Capital express (B3):** Three extra unique Capital-to-resource/town links appear in Electric only. Electric Capital Express routes yield 2 Gold, plus the extra Gold from Express Lines and +1 for touching the Capital. All six additional routes still use normal route materials and owned-segment discounts.
3. **Era-gated server authority:** Legal targets exclude future routes. The private player cannot submit an order for a future era. Reveal also revalidates unlocks. The public view omits the charters entirely until Iron or Electric begins, protecting TV/phone consistency and preventing early access.
4. **UI:** New viaducts are turquoise and Capital Express links lavender; paths blocked by rival track are grey. Client renderers show owned lines in tycoon colours. New era announcements and animated route reveals are reduced-motion aware. Phone target names distinguish the two special charter types.
5. **Provisional victory thresholds (B5):** Quick 12, Standard 20, Advanced 22. The public scoreboard, phone handbook, TV handbook, and project documentation were updated consistently. The values are preliminary because not all statistical targets are achieved.
6. **Simulation fairness improvements:** The headless harness rotates tycoon avatar assignments per game rather than giving each starting seat the same Advanced perk. Shared crowns allocate fractional credit to each tied champion. It records winners finishing above 80% of the target as well as early-win percentage and seat win rates.
7. **Regression coverage:** Expanded map tests and six B3-specific tests including actual round-boundary era announcements, valid contiguous bridges, no duplicate endpoints, hidden early charters, server-side refund after invalid Reveal and Electric income with upgrade bonuses.

## Reliability and scope

- Stress-tested 1,500 separately seeded generated maps with **4,500 valid bridges**, plus real era-transition and scoring checks. A rare no-unique-immediate-bridge edge case was caught by the expanded tests and fixed via approach ramps.
- The locally executable Node test suite passed 115/115 checks. The `ws` package is unavailable in the offline runtime, so the WebSocket-dependent tests and actual TV/browser sessions **have not been rerun** against this development build.
- Original eight realistic human avatars and all 17 locally bundled Sonilo/Mirelo audio tracks remain intact.
- Production GitHub `main` and Render are untouched because this is not yet a release-quality v2.

## Outstanding before 2.0.0

- 2,000-game per-mode, per-player-count fairness acceptance, 90%-within-80%-of-target benchmark and eight-player Prestige tie reduction; see `docs/BALANCE.md`. A 60-game eight-player sample is not enough to certify fair starting seats.
- Full responsive browser snapshots / live WebSocket reconnection tests with the new B3 route counts and three actions.
- Production UI re-review of bridge reveals and audio balance on real TV + phones.
- Fonts, retired avatar-file clean-up, changelog, README / version consolidation and final updated design bible (Part F).

The independent reviewer’s implementation plan remains authoritative for scope. This stage is a measured progress checkpoint, not a claim that every acceptance criterion has been met.
