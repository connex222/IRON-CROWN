# IRON CROWN — Practical Game-Night Acceptance Checklist

Mark these only after personally checking on a real TV and phones.

- [ ] Open the published TV URL and confirm the premium logo, avatar images, QR and room code.
- [ ] On the same deployed host visit /health: status ok, version 1.10.0, installedSounds 17, expectedSounds 17.
- [ ] Visit /audio/manifest.json and verify the 17 local MP3 filenames; listen to at least a whistle, dice, clash and victory cue.
- [ ] Join from 2, 4 and ideally 8 phones; confirm unique tycoons, readable action controls and private contracts.
- [ ] Take a phone offline and online during the lobby and planning rounds. It must recover the same seat and TV Online/Away status without duplicates.
- [ ] Disconnect the TV temporarily. It must recover the same host room rather than starting another one.
- [ ] Verify that an absent human blocks Start and the TV identifies who must reconnect or be replaced with AI.
- [ ] Replace one human with AI, check the confirmation, and verify their phone can no longer make moves.
- [ ] Complete a Quick game. Press Play again and confirm the new lobby opens with zero old Prestige, no prior tickets, original tycoons and rejoinable invited players.
- [ ] Test Quiet, Balanced and Cinematic sound profiles on actual speakers. Important clashes and fanfares should duck the background.
- [ ] Check iPhone Safari and Android Chrome in portrait and landscape, including larger system text.
- [ ] Verify Tab, Enter, Space and Escape navigation, reduced motion and measured WCAG colour contrast.
- [ ] Repeat with phones in a different house; record all issues with device, browser and steps to reproduce.

Game-night success criterion: No lost seats or unapproved room replacement, accurate private information handling, understandable controls, audible but conversation-friendly sound.

**Note:** Passing server-side tests does not establish real-device or Render deployment readiness.
