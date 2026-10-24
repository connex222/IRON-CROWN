# IRON CROWN — The Five Lost Crowns soundtrack implementation

**Added:** 24 October 2026  
**Game:** IRON CROWN v2 Stage 13 development branch  
**Music:** *The Five Lost Crowns* — user-supplied MP3

The uploaded composition is the **first-choice TV background soundtrack**, in place of the earlier automatic Daydream selection. Both previous local musical themes remain available as fallbacks. Phone controllers retain their optional short effects and do not continuously stream music.

## File verification

| Attribute | Value |
| --- | --- |
| Original upload | `The Five Lost Crowns.mp3` |
| Length | 190.0147 seconds (3 min 10 sec) |
| Original size | 6,147,864 bytes |
| Original SHA-256 | `f7948e793251bd68176ccb1176f7bdbf37672d1f89fe20fe11d5c85880147ca3` |
| Web-delivery asset | `public/audio/music-five-lost-crowns.mp3` |
| Delivery size | 3,800,963 bytes |
| Web-delivery SHA-256 | `137be7367127fc94615486c04c856067daed60f3c66d0be609e87c3f752626f2` |
| Delivery codec | MP3, 160 kbps stereo at 44.1 kHz |
| Audio adjustment | Overall volume lowered by 2 dB for headroom; no composition edits |

The original user-provided MP3 remains unchanged. The web version was transferred to GitHub with binary blob SHA `619555ba730e8666641495a39c9f4d87918de73b` and decoded from start to finish to confirm format and integrity.

## Playback

The TV selects in this order: **The Five Lost Crowns → deluxe parlour score → original parlour score**. Playback remains disabled until the host enables sound, respects the music slider, pauses on hidden tabs and ducks during important sound effects. It uses only same-origin files.

This adds one to the allowed game media inventory: **17 original tracks + 10 additional tracks = 27 listed audio assets**, with a separate collection of 17 mastered versions. All 26 previous original/additional assets are retained.

## Release limits

The recording is supplied by the game owner for integration into this development build. This does not independently establish a licence for commercial or public redistribution. Confirm copyright and/or music generation rights before merging to the production branch or selling the game. Real TV-speaker and mobile-browser listening acceptance is also outstanding.
