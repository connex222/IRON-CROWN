# Iron Crown — Phase 3 continuation (v1.3.0)

## Production changes

- **Server-controlled character reactions.** Each tycoon now has a publicly visible four-second `smug`, `furious`, or neutral state, with an expiry timestamp and short, non-secret explanation. Client UI changes are display-only; no client can assign a reaction.
- **Actual game-event triggers.** New Cities, completed Destination Tickets, gained/lost Longest Railway or Largest Army trophies, failed orders, clashes (winner and loser), and the overall winner produce appropriate reactions. Trophy notifications are emitted only when ownership actually changes.
- **TV railway gazette.** New-City, completed-contract, trophy-gain and trophy-loss notices now show the involved human portraits. The leaderboard refreshes active expressions and automatically reverts portraits and captions after four seconds without another WebSocket message.
- **Era-led presentation.** Steam, Iron and Electric each adjust TV roster and phone identity framing. The phone's era selection screen now features the player's human character alongside era-specific copy and existing working Upgrade cards.
- **Premium UI readability.** TV header buttons now have light text against the dark brass bar. The mobile reaction caption passes a substantially stronger light-background contrast. Small phone labels and character descriptions use a minimum 16px override, while editing and precision-selection buttons use 56px minimum touch heights where appropriate.
- **Portrait fallbacks.** Missing local artwork is replaced with an offline, colour-specific SVG monogram generated in the browser. No external image or typeface service is required.
- **Timer presentation.** Countdown displays now format minutes and seconds instead of showing `0:90` for a ninety-second window.

## What has NOT changed

- The eight approved human tycoon master portraits and the 72 era/mood PNG paths are intact; portraits remain photography-style generated characters.
- The artwork for **all 72 independently different facial poses and outfits is still outstanding**. The bundled images are treatments of the eight approved faces; this release adds reliable reactions and era UI presentation, not newly modelled expressions or attire.
- Railway rules, simultaneous two-order planning, Prestige, modes, Advanced perks, income, map generation and private ticket secrecy remain under the uploaded `01-iron-crown.md` bible.
- Offline demo screenshots use a sample room state and local downsized portraits. They demonstrate rendering, **not** real multiplayer or QR-code scanning.

## Verification performed

- **23 / 23 Node tests passed** with `npm test`. The five added tests cover live reactions to successful City upgrades, failed orders, trophy transfers, multi-party claims, and TV/phone reaction support.
- Both browser inline scripts compile under the Node test runner.
- Headless Chromium rendered the TV lobby, TV board and mobile UI using an offline, synthetic state fixture with no JavaScript exceptions or missing preview media.
- The `ws` package was not installed in this container, so live WebSocket sessions, actual QR scanning, simultaneous phone transactions, deployment and real-device ergonomics **have not been validated**.

## Launching

```
npm install
npm test
npm start
```

Open the host URL on a TV/desktop and join using the QR code from a phone. See README.md for Render deployment. Run a proper multiplayer device test before treating the build as release-approved.
