# Changelog

[日本語](CHANGELOG.ja.md) | [English](CHANGELOG.md)

## v0.4.0

### Transcription and translation

- Added 60-second `gpt-transcribe` final transcripts alongside low-latency `gpt-live-transcribe` flush transcripts.
- Replaced completed flush items ending at or before the latest final transcript while keeping active flush items visible.

## v0.3.1

- Ask to stop the session before opening Settings when it is not idle.

## v0.3.0

### Transcription and translation

- Switched transcription to `gpt-live-transcribe`.
- Added settings for the prompt, keywords, and input language.

### Controls and display

- Moved language selection into Settings.
- Added main-panel text sizes and refined the layout.

## v0.2.1

### Transcription and translation

- Added `Commit` to finalize the current transcript and update translations during longer speech.

### Controls and display

- Made `Start` and `Stop` switch with the session state.

## v0.2.0

### Transcription and translation

- Switched transcription to `gpt-realtime-whisper` and translation to `gpt-5.6-luna`.
- Updated transcripts and translations incrementally.

### Controls and display

- Added timestamps and automatic scrolling.
- Added an automatic 30-minute session limit.

## v0.1.0

- Initial browser-based real-time transcription and translation using `gpt-4o-transcribe`.
