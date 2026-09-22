# ledad

[日本語](README.ja.md) | [English](README.md) | [Français](README.fr.md) | [中文](README.zh.md)

![ledad real-time transcription, translation, and AI Insights demo](docs/assets/ledad-demo.gif)

UI demo with sample data.

Browser-based web app for real-time speech transcription, translation, and conversation summaries with AI Insights using microphone input.

Built with Next.js 16, React 19, TypeScript, and the OpenAI Realtime and Responses APIs.

## Features

- Browser microphone input
- Low-latency preliminary and 60-second final transcriptions
- Translation of preliminary and final transcripts
- Topic summaries and the current topic in the source language
- Source and target language switching
- Start, stop, commit, and clear session controls

## Usage

Click the gear icon (`Settings`) at the top right, adjust the following settings, and press `Save`. Settings are saved in this browser.

- `Source language` / `Translation language`: English (`en`), Japanese (`ja`), Chinese (`zh`), or French (`fr`). The default is English → Japanese. The bottom control panel displays the selected language direction.
- `Text size`: S, M, or L (default: M).
- `Prompt`: topic or recording context for transcription.
- `Keywords`: names, technical terms, or acronyms as spelling hints, one per line.

Opening settings while the session is not idle asks you to confirm stopping it. Text size takes effect immediately after saving; all other settings apply when the next session starts.

Press `Stop` to stop microphone input and the Realtime connection.

Press `Commit` to commit the current audio buffer and finalize the current transcript for translation. During a session, the audio buffer is also committed automatically every 15 seconds.

Press the eraser icon (`Clear`) at the bottom right of the main panel to clear the displayed history without stopping the session.

The left-hand `AI Insights` panel shows `All Topics`, merging repeated discussions of the same topic, and a separate `Current Topic`. Click a title to expand its summary. On narrow screens, topics appear above the transcript.

While listening, the app checks for changes every minute and summarizes the displayed transcript and translation with `gpt-6-luna`. Summaries appear in the translation language. The refresh button beside `AI Insights` regenerates the summary even when the content has not changed. The button is disabled during processing, and the last summary remains visible after stopping. Summaries are for reference.

## Requirements

- Node.js
- OpenAI API key

## Supported browsers

Use the latest stable version of Chrome, Edge, Firefox, or Safari (including iOS Safari). Internet Explorer and outdated browsers are not supported.

Microphone access also requires a secure context (HTTPS or `localhost`) and browser permission.

## Setup

Create `.env.local` and set your OpenAI API key.

```bash
OPENAI_API_KEY=your_api_key
```

Install dependencies.

```bash
npm install
```

Start the development server.

```bash
npm run dev
```

Open this URL in your browser.

```txt
http://localhost:3000
```

## Notes

- You need to allow microphone access in the browser.
- Sessions stop automatically after 30 minutes. Press `Start` again to continue.
- The OpenAI API key is used only on the server and is not exposed to the browser.
- OpenAI API usage may incur costs.

[Changelog](CHANGELOG.md)
