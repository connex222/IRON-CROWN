# Phase 6 Audio Upgrade · v1.8.1

- Mirelo generated 16 sound effects, mechanical railway sounds, audience cues and loops.
- Sonilo generated one 75-second original instrumental Victorian parlour track.
- 17 sounds map directly to Phase 6 cue names, stored under /public/audio/*.mp3 by the import workflow.
- One-time GitHub Actions importer verifies each MP3 and commits the actual assets; no runtime links to third-party providers.
- Audio mixer, opt-in sound and synth fallback retain the existing behaviour.
- This revision does not alter any game rules, avatars or network protocols.
- Generation completed, but sound-package GitHub Actions installation must be checked separately.
