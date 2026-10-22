# IRON CROWN

A private, cross-device Victorian railway empire game. One browser window is the **shared TV board**; two to eight phones/tablets are **secret controllers**. The Node.js server validates all orders and owns the authoritative state.

## Get running locally

Requires **Node.js 20 or newer**.

```bash
npm install
npm start
```

Open **http://localhost:3000/** on the host screen. You will see a four-letter room code and an in-page QR code. Open the QR URL or `http://localhost:3000/phone.html?room=CODE` on a phone. Both devices **must reach the same server**. `localhost` on a phone refers to the phone, not your computer: use your computer's LAN IP or an HTTPS deployment instead.

For development: `npm run dev`. To run the automated rules suite: `npm test`.

## Host an evening

1. Open the TV URL. It creates a fresh private room, saving the host credential in browser storage so a refresh rejoins the room.
2. Invite 1–7 other friends (at least two players total), each with a separate device or tab. Enter a name and pick one of eight available tycoons.
3. Select **Quick**, **Standard**, or **Advanced**. Use **+ Add AI** for a computer-controlled seat or **AI** beside a human to replace them. The host can remove lobby players; in-progress removals transfer the seat to AI to protect game continuity.
4. Start. Each player chooses two of three secret tickets, then places two free Depots in snake order. Every era begins with a free Upgrade draft.
5. The TV shows Income → simultaneous phone Plans → Reveal. Actions are validated and resolved by the server. Unfilled action slots pass automatically. Trade offers are handled on the recipient's phone.
6. First to the mode's Prestige target wins at the end of Reveal, or the highest score after the last round. The host can start a rematch.

### Modes

| Mode | Rounds | Era lengths | Win target | Rules |
| --- | ---: | --- | ---: | --- |
| Quick | 8 | 3 / 3 / 2 | 10 Prestige | 60-second planning; no events/perks |
| Standard | 12 | 4 / 4 / 4 | 15 Prestige | 90-second planning; no events/perks |
| Advanced | 12 | 4 / 4 / 4 | 15 Prestige | 12 shuffled events; character perks; unfinished-ticket penalty |

### First-round tutorial

On a first visit, the phone offers contextual guidance through the first round: avatar selection, secret tickets, starting Depots, era Upgrade, planning and watching Reveal. The guidance accompanies real, interactive actions rather than a simulated game; it dismisses automatically after the first round and can be hidden. Players may open **Rules** on either screen at any time.

## Architecture

- `src/server.js` — built-in HTTP server + one runtime package, **ws**, for WebSockets; room identity and reconnect authentication, timers, broadcast, and optional on-disk snapshots.
- `src/map.js` — 37-radius-3-hex generation with non-adjacent Lakes; 18 paths of 2–5 non-Lake segments; 24 destination cards; rail connectivity.
- `src/game.js` — authoritative turn state machine, validations, simultaneous claims, combats, trades, upgrades, events, scoring, AI and winner rules.
- `src/constants.js` — authoritative modes, avatars, upgrades, events, map counts.
- `public/tv.html` — self-contained host interface with built-in QR encoder, painted SVG map, animated locomotives, player roster, Prestige board, trophy panels and browser-synthesised sound.
- `public/phone.html` — self-contained one-thumb controller, reconnection, target map, plan slots, trading, tickets, era draft, tutorial and results.
- `public/art/avatars` — **72 original local PNGs**: eight tycoons × three eras × three expressions; fallback colour portraits if a specific image fails to load.
- `public/art/iron-crown-crest.svg` — original locally bundled crest.
- `test/game.test.js` — Node's built-in test runner, with procedural map and rules tests.

No external image services, JavaScript CDNs, external style sheets, or sound hosts are required. TV sound effects and the optional music-hall-style background melody are synthesised in the browser when enabled by a user gesture.

### Rendering and private data

Public state excludes player credentials, secret Destination Tickets, un-revealed actions and resource inventories. Only the authenticated player's socket receives that player's private view. A reconnect token is persisted in browser `localStorage` and is checked on the server. UI choices are advisory; the engine rechecks legality and available resources.

### State persistence

By default, room snapshots are written atomically to `.data/rooms.json`. Override the location with `STATE_FILE=/path/to/rooms.json` or set `STATE_FILE=''` to disable disk snapshots. **A Render instance's default filesystem is ephemeral**. To preserve games through instance replacement, configure a persistent disk and set `STATE_FILE` to a path on that disk. Rooms do **not** synchronise across multiple server instances; deploy one instance, or add an external coordinated state store before scaling horizontally.

## Deploy to Render

1. Push the folder's contents to a new GitHub repository.
2. On Render choose **New → Blueprint**, select the repository, and use the supplied `render.yaml`. Alternatively create a Node Web Service with build `npm install --omit=dev`, start `npm start`, and health check `/health`.
3. For better session stability use a paid always-on instance, HTTPS and one instance only. Configure the optional persistent disk if games must survive full server restarts.
4. Open your deployed `https://…onrender.com/` URL on the TV. Players scan the on-screen QR code. `wss://` is used automatically on HTTPS.

Render assigns its own `PORT` environment variable. The server honours it and binds to `0.0.0.0`.

## Tests and release verification

`npm test` includes checks for 120 procedural maps (distribution, non-touching Lakes, path lengths and adjacency), private ticket selection, resource budgeting, clash progression, scoring, trade rejection, Advanced costs, automatic re-entry, self-contained browser scripts and a complete simulated Quick game with AI.

**Run real-device acceptance tests before a public launch.** In particular: connect at least two real phones and a TV simultaneously; lock plans from both phones; offer/decline a trade; leave and rejoin during an active round; switch networks; try all eight tycoons; verify Quick/Advanced and all 12 events; test the Telegraph timing; inspect the interface on low-end phones; and verify Render restart/recovery.

## Design-bible clarifications

The accompanying `01-iron-crown.md` is the game's authoritative design bible. Two minor rule ambiguities were resolved explicitly rather than inventing unrelated gameplay:

- The bible specifies **nine total Upgrade cards** (three each era), but the Inventor is also supposed to see **four cards**. The Inventor's fourth displayed option, *Experimental Patent*, commissions one random available published Upgrade. No tenth unique Upgrade effect was invented.
- The deck has **24 tickets**, which can be completely dealt to eight players (three each). Tickets discarded in initial selection return to the deck, allowing Research to draw them. If everyone keeps all three, the deck is empty until cards become available; Research refunds if empty.

**Font limitation:** Browser-offline system fonts are used for the deliverable (`Georgia`/system sans-serif). The requested Playfair Display and Inter binary font files are not distributed in this package. Use appropriately licensed versions as local assets in a future art integration pass if exact font matching is required. No external font service is contacted.

**Verification scope:** The engine suite passes locally. The current build environment cannot fetch the required `ws` npm package from the registry, so a full browser-to-server WebSocket acceptance run has **not** been performed here. `npm install` on a network-connected developer machine or Render should install the declared dependency normally; verify it there before treating the build as release-approved.
