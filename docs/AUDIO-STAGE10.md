# IRON CROWN v2.0.0-dev.10 — Completed staging audio integration

**Date:** 24 October 2026  
**Branch:** `staging/iron-crown-stage10-audio`  
**Production:** untouched; not release-certified.

## Bundled and verified

- **17 existing original MP3s**, unchanged under `public/audio/`, with matching source hashes.
- **17 mastered copies** in `public/audio/mastered/`, produced from local originals using loudness normalisation and peak control. Original assets are retained as fallbacks.
- **8 new Mirelo effects:** railway switch, contract stamp, trade handshake, Royal Ledger, Grand Station, ticket completion, invalid order, Electric era.
- **1 new Daydream instrumental score:** `music-parlour-deluxe.mp3` (approx. 109 seconds), played instead of `music-parlour.mp3` if available, without altering the original.
- **26 locally served primary audio files** in `public/audio/`, plus 17 optional mastered editions. No browser audio requests to Mirelo, Daydream or Sonilo.
- Explicit per-file SHA-256 entries in `docs/STAGE10-BESPOKE-SHA256.txt`, with source job references in `docs/AUDIO-GENERATION-STATUS.json`.

## Integration behaviour

TV audio starts disabled until a host gesture; phone cues are independently opt-in. Quiet, Balanced and Cinematic profiles remain available. Reveal sounds duck looping music and railway ambience. No more than three simultaneous priority-limited effects play. A missing bespoke cue uses an existing local recording, and missing mastered files revert to their originals.

## Independent verification

The initial full-v2 staging test showed 177/177 passes **before** new audio. After installing and decoding all nine new tracks, the suite was rerun with adjusted original-versus-bonus inventory assertions and again passed **177/177**, including true WebSocket tests (GitHub Actions run `40089325317`).

This is a *code/automated audio integrity* result. It is **not** a claim of verified physical loudness, hardware compatibility or commercial redistribution rights.

## Remaining production gates

Quick four-player early victories were 66.25% against an acceptance ceiling of 50%; do not mislabel the mode as balanced. Verify commercial-use/redistribution permissions for all provider audio, run real iOS/Android/TV/cross-network checks, test actual speakers and rematches, and demonstrate durable recovery and a rollback plan before merging to `main`.
