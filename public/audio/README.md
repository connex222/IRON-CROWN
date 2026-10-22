# Iron Crown — generated sound pack (v1.8.1)

17 audio cues are being generated and installed from Mirelo (16 sound/ambience recordings)
and Sonilo (1 instrumental parlour theme). The existing server dynamically discovers
the files by basename; its JSON manifest points every TV client to locally served MP3s.

The one-time GitHub Actions job imports files into this directory, validates actual MP3
codec, reasonable duration and max size with ffprobe, commits the generated files,
and removes the temporary signed download URL list.

Open the game's TV Audio Settings and enable Sound. Audio is muted until the host
deliberately enables it; master SFX and music have separate controls. The synthesised
fallback remains for missing files, slow connections or blocked playback.

Required files:
- train-whistle.mp3
- train-chug.mp3 (loop)
- steam-release.mp3
- track-lay.mp3
- depot-build.mp3
- city-build.mp3
- coin-clink.mp3
- dice-roll.mp3
- clash-impact.mp3
- crowd-gasp.mp3
- crowd-cheer.mp3
- era-fanfare.mp3
- victory-fanfare.mp3
- ui-select.mp3
- ui-confirm.mp3
- ambience-railway.mp3 (loop)
- music-parlour.mp3 (loop)

After installation, generated file metadata with SHA-256 checksums is in
GENERATED-ASSETS.json. Provenance and licence verification notes are at root:
AUDIO-LICENCES.md. External runtime CDNs are not used.
