# IRON CROWN v2 — Stage 10 sound integration

The v2 game uses the 17 source MP3s unchanged in `public/audio/` and 17 locally mastered variants in `public/audio/mastered/`. It recognises eight optional Mirelo event recordings and a Daydream soundtrack from `public/audio/` only. No browser calls provider URLs. If a file is absent or fails, the engine uses a local fallback. Sound is off until the host enables it; phone audio remains independently optional.

The eight new cues are `railway-switch`, `contract-stamp`, `trade-handshake`, `royal-ledger`, `grand-station`, `ticket-complete`, `invalid-order`, and `electric-era`. The optional Daydream file is `music-parlour-deluxe.mp3`; when absent, the original `music-parlour.mp3` plays.

**Staging packaging:** Copy the nine verified MP3 files from their providers to `public/audio/<name>.mp3`. Keep exact provenance, hashes, duration/format and licences with release evidence. Do not store signed provider URLs in public runtime code or production. Verify WAV/MP3 integrity and crossfade/loop behaviour on hardware. The generated recordings are not a substitute for physical testing or legal clearance.

Quick four-player balance, full multi-device acceptance and licensing remain release blockers for any production promotion. Stage 10 audio completion is distinct from v2.0.0 production certification.
