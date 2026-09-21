# ledad

[日本語](README.ja.md) | [English](README.md) | [Français](README.fr.md) | [中文](README.zh.md)

![ledad real-time transcription and translation demo](docs/assets/ledad-demo.gif)

UI demo with sample data.

Browser-based web app for real-time speech transcription and translation using microphone input.

## How it works

The browser streams microphone audio to the OpenAI Realtime API over WebRTC. The OpenAI API key is handled only on the server. Transcription and translation update automatically as you continue speaking.

Built with Next.js 16, React 19, TypeScript, and the OpenAI Realtime and Responses APIs.

## Features

- Browser microphone input
- Real-time speech transcription
- Translation of transcribed text
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

## Requirements

- Node.js
- OpenAI API key

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
- OpenAI API usage may incur costs.

[Changelog](CHANGELOG.md)
