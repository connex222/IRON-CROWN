# Iron Crown QA — Gold Button Repair, v1.12.1

**Root cause:** Secondary buttons on TV and phone used transparent backgrounds. The TV navigation additionally used extremely faint gold fills. Disabled buttons faded to 45% opacity. These rules made functional buttons appear to have lost their golden styling.

**Corrections:** Restore warm gold gradients with contrasting dark typography to secondary actions, host navigation, hero Lore, phone Story/Sound, and help navigation. Keep danger buttons red/outlined. Improve disabled gold control visibility. Keep primary gradients unchanged.

**Browser verification:** GitHub Actions uses real Playwright Chromium to run the actual server, inspect computed gold backgrounds, check horizontal overflow and image loading at TV 1920, desktop 1280, tablet 768, compact host 390, phone 320/390, dark themes and responsive help screens. It joins a phone to a TV host, selects a tycoon, adds a computer opponent, opens the game and ticket screen, checks all 17 audio cue names and media, and enables both TV and phone audio. It uploads actual browser screenshots and JSON evidence as workflow artifacts.

**Remaining:** Physical television overscan, colour contrast of every interaction, screen readers, iOS and Android browser-specific autoplay, Render state persistence and inter-home real-player multiplayer testing still require hands-on checks.
