#!/usr/bin/env bash
set -euo pipefail
# Derived, locally served recordings for the staging audio upgrade.
# Keep the 17 licensed source MP3s unchanged in public/audio/.
command -v ffmpeg >/dev/null || { echo 'ffmpeg is required to render mastered variants' >&2; exit 1; }
mkdir -p public/audio/mastered docs
count=0
for name in train-whistle train-chug steam-release track-lay depot-build city-build coin-clink dice-roll clash-impact crowd-gasp crowd-cheer era-fanfare victory-fanfare ui-select ui-confirm ambience-railway music-parlour; do
  src="public/audio/${name}.mp3"
  dst="public/audio/mastered/${name}.mp3"
  test -s "$src" || { echo "Source missing: $src" >&2; exit 1; }
  target=-17
  extra=",afade=t=in:st=0:d=0.015"
  case "$name" in
    music-parlour) target=-21; extra="" ;;
    ambience-railway|train-chug) target=-25; extra="" ;;
  esac
  ffmpeg -hide_banner -loglevel error -nostdin -y -i "$src" \
    -af "highpass=f=32,lowpass=f=16500,loudnorm=I=${target}:TP=-2.0:LRA=9${extra}" \
    -ar 48000 -ac 2 -c:a libmp3lame -b:a 160k "$dst"
  ffmpeg -v error -nostdin -i "$dst" -f null - >/dev/null 2>&1
  test -s "$dst"
  count=$((count+1))
done
test "$count" -eq 17
sha256sum public/audio/mastered/*.mp3 > docs/AUDIO-STAGING-MASTER-SHA256.txt
printf 'Rendered and decoded %d local mastered tracks.\n' "$count"
