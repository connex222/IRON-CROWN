# Iron Crown — Optional Licensed Audio

The game works without any of these files. It uses quiet, local synthesised
sound effects when professional sounds are unavailable; optional music is
similarly synthesised. Nothing is streamed from a third-party site.

Copy legally redistributable audio into this directory, named **exactly** as
follows. The audio scanner automatically detects `.ogg`, `.wav` or `.mp3` (in
that priority), with no configuration or redeploy-time manifest editing.
The server will discover files after they are uploaded and deployed.

| Filename stem | Suggested recording | Duration | Category |
| --- | --- | --- | --- |
| train-whistle | Period steam locomotive whistle | 2–4 s | SFX |
| train-chug | Steam wheels and piston rhythm, seamless loop | 4–8 s | Ambience |
| steam-release | Pressure hiss from a valve | 1–3 s | SFX |
| track-lay | Heavy metal railway construction impact | 1–2 s | SFX |
| depot-build | Hammer striking wood, construction hit | 1–2 s | SFX |
| city-build | Industrial construction, final flourish | 2–4 s | SFX |
| coin-clink | Gold sovereign coin fall | 0.5–1.5 s | SFX |
| dice-roll | Heavy dice tumble on varnished wood | 1–2 s | SFX |
| clash-impact | Quick battle/industrial impact | 1–2 s | SFX |
| crowd-gasp | Victorian theatre-style gasps | 1–2 s | SFX |
| crowd-cheer | Restrained triumphant crowd | 2–4 s | SFX |
| era-fanfare | Brass fanfare for new age | 3–6 s | SFX |
| victory-fanfare | Coronation brass/orchestral finale | 5–10 s | SFX |
| ui-select | Small refined brass/mechanical click | <1 s | SFX |
| ui-confirm | Two-note confirmation chime | <1 s | SFX |
| ambience-railway | Distant railway station, steam, soft rain | 30–60 s | Loop |
| music-parlour | Gentle music-hall strings/piano, no vocals | 60–120 s | Loop |

**Licensing:** only use assets with a commercial game redistribution licence,
keep receipts/attribution where required, and avoid uncleared music or recordings.
Record their creator, license, URL, and proof of permission in
`AUDIO-LICENCES.md` (an example table is provided at the project root).

**Production:** OGG Vorbis at 44.1/48 kHz is convenient for small files;
WAV and MP3 work too. Trim leading silence, avoid heavy clipping and
normalize effects consistently at sensible headroom. Mono short SFX is fine;
ambience and music should be stereo. Loop tracks need seamless starts/ends.

**Implementation:** UI *Sound on* checks the locally generated manifest,
then uses a supplied sound where available. The sound-off default respects
browser autoplay rules. Host can control effects and music volumes separately.
