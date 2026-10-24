# IRON CROWN Stage 10 — audio-only staging rollout

This branch is **not** the v2.0.0-dev.10 complete game release. The Render staging service is based on the production v1.12.1 source plus preflight safety changes.

The audio-only staging update:
- Preserves the 17 original MP3 files at `public/audio/`
- Renders 17 locally mastered MP3s to `public/audio/mastered/`
- Uses 32 Hz high-pass, 16.5 kHz low-pass, programme-target normalisation (-21 LUFS music, -25 LUFS ambience, -17 LUFS FX) and -2 dB true-peak target
- Switches TV/phone playback to local mastered recordings, with original-file fallback for missing mastered tracks; phone opt-in remains mandatory
- Preserves separate master/effects, music and ambience control and event priority limits
- Adds automated decoding and checksums of mastered assets

**Exclusions:** The eight Mirelo and one Daydream recordings are not included. The full v2 engine/UI and its 148 local tests are not integrated into this branch. Advanced and Quick balancing plus physical acceptance and licence clearance remain open. No production release is authorised by this staging-only change.
