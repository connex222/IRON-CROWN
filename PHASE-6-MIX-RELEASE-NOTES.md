# Iron Crown — Phase 6.2 Audio Mixing, version 1.8.2

- Three profiles (Quiet, Balanced, Cinematic) and Custom settings with independent Sound effects, Music and Railway ambience controls.
- Preserve previous settings by migrating the former master-volume key to effects volume.
- Per-cue gain, retrigger cooldown and priority for all 17 Sonilo/Mirelo audio recordings.
- Maximum of three simultaneous short effects. A higher-priority cue can replace a lower-priority one.
- Background music and ambience smoothly duck on train whistles, clashes, City construction, new eras and victory.
- Hidden TV tabs pause long-running audio and stop transient effects. Muting stops audio immediately. Sound never automatically enables on refresh.
- A preview selector tests whistle, dice, clashes, coins, era and victory fanfares and the selection click.
- No new runtime dependencies, third-party media URLs, gameplay-rule changes or server-protocol changes.

Verification: 8 new audio policy/UX tests added; confirm the successful complete GitHub Actions run (70 total). The sound mixer now defaults to Balanced on fresh installs, auditions without an additional whistle, and inventories installed files without playing audio.
Outstanding: physical television speaker balancing and Render deployment verification.
