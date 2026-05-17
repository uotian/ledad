# ledad

Realtime speech transcription and translation web app.

## Requirements

- Node.js
- OpenAI API key

## Setup

Create `.env.local`.

```bash
OPENAI_API_KEY=your_api_key
```

Install dependencies and start the app.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## What It Does

- Captures microphone audio in the browser.
- Connects to OpenAI Realtime over WebRTC for speech transcription.
- Sends completed transcripts to OpenAI for translation.
- Lets you switch source and target languages before starting a session.

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```
