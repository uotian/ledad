# ledad

[日本語](README.ja.md) | [English](README.md) | [Français](README.fr.md) | [中文](README.zh.md)

![ledad real-time transcription, translation, and AI Insights demo](docs/assets/ledad-demo.gif)

Browser-based web app for real-time speech transcription, translation, and conversation summaries with AI Insights using microphone input.

Built with Next.js 16, React 19, TypeScript, OpenAI APIs, and Gemini APIs.

## Features

- Browser microphone input
- Gemini (default) or OpenAI speech-to-text
- Low-latency preliminary and 60-second final transcriptions
- Translation of preliminary and final transcripts
- Topic summaries and the current topic in a separately selected language
- Source and target language switching
- Start, stop, and clear session controls

## Usage

Click the gear icon (`Settings`) at the top right, adjust the following settings, and press `Save`. Settings are saved in this browser.

- `Speech language` / `Translation language`: English (`en`), Japanese (`ja`), Chinese (`zh`), or French (`fr`). The default is English → Japanese. The bottom control panel displays the selected language direction.
- `Insights language`: English (`en`), Japanese (`ja`, default), Chinese (`zh`), or French (`fr`), independently of the source and translation languages.
- `STT Provider`: Gemini (default) or OpenAI for speech-to-text.
- `Text size`: S, M, or L (default: M).
- `Prompt`: topic or recording context for OpenAI transcription.
- `Keywords`: names, technical terms, or acronyms as spelling hints, one per line.

Opening settings while the session is not idle asks you to confirm stopping it. Text size takes effect immediately after saving; all other settings apply when the next session starts.

Press `Stop` to stop microphone input and the Realtime connection.

Preliminary transcripts and translations update while you speak.

Press the eraser icon (`Clear`) at the bottom right of the main panel to clear the displayed history without stopping the session.

The left-hand `AI Insights` panel shows `All Topics`, merging repeated discussions of the same topic, and a separate `Current Topic`. Click a title to expand its summary. On narrow screens, topics appear above the transcript.

While listening, the app checks for changes every 30 seconds and summarizes the displayed transcript and translation with `gpt-6-luna` (OpenAI). Summaries appear in the Insights language (Japanese by default). The refresh button beside `AI Insights` regenerates the summary even when the content has not changed. The button is disabled during processing, and the last summary remains visible after stopping. Summaries are for reference.

## Requirements

- Node.js
- OpenAI API key
- Gemini API key

STT uses OpenAI or Gemini APIs; translation and AI Insights use OpenAI APIs.

## Supported browsers

Use the latest stable version of Chrome, Edge, Firefox, or Safari (including iOS Safari). Internet Explorer and outdated browsers are not supported.

Microphone access also requires a secure context (HTTPS or `localhost`) and browser permission.

## Setup

Create `.env.local` and set both API keys for the default configuration.

```bash
OPENAI_API_KEY=your_api_key
GEMINI_API_KEY=your_gemini_api_key
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
- API keys are used only on the server and are not exposed to the browser.
- OpenAI or Gemini API usage may incur costs.

[Changelog](CHANGELOG.md)
