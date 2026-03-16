# Scam Handler

An AI voice agent that acts as an acoustic bridge for suspicious phone calls.

Place your phone on speakerphone next to your computer. The app listens through the computer microphone, transcribes what the caller says, generates a short AI reply, and plays the response back through the speakers.

```
Caller → phone speaker → computer mic → AI → computer speaker → phone mic → caller
```

---

## Architecture

```
app/
  page.tsx                  — Main UI page (conversation loop orchestration)
  layout.tsx                — App shell
  api/
    transcribe/route.ts     — POST: audio blob → transcribed text (Whisper)
    reply/route.ts          — POST: transcript history → AI reply (GPT-4o-mini)
    synthesize/route.ts     — POST: text → audio MP3 (OpenAI TTS)

components/
  AgentControls.tsx         — Start / Stop / Mute buttons
  StatusBadge.tsx           — Status indicator (idle / listening / thinking / speaking / error)
  TranscriptPanel.tsx       — Scrollable conversation log

lib/
  audio/
    microphone.ts           — MediaRecorder-based mic capture
    playback.ts             — Web Audio API playback
  ai/
    transcribe.ts           — Client-side fetch to /api/transcribe
    generateReply.ts        — Client-side fetch to /api/reply
    synthesizeSpeech.ts     — Client-side fetch to /api/synthesize
  state/
    agentStateMachine.ts    — State transition logic
  types/
    agent.ts                — Shared TypeScript types
```

### Conversation state machine

```
idle → listening → thinking → speaking → listening (loop)
                 ↘           ↘           ↘
                  error       error       error
                                          ↓
                                         idle (Stop)
```

Turn-taking: while the agent is speaking the microphone is stopped. It restarts only after playback finishes, preventing audio feedback.

### Language behaviour

The agent replies in **Danish by default**. If the caller clearly speaks another language, the agent will naturally switch to that language. This is controlled by the system prompt in `app/api/reply/route.ts` and requires no configuration.

---

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd spamgulag-mvp
npm install
```

### 2. Environment variables

Copy the example file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your OpenAI API key:

```
OPENAI_API_KEY=sk-...
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How to demo

1. Run the app (`npm run dev`)
2. Open http://localhost:3000 in a browser
3. Answer a call on your phone and put it on speakerphone
4. Place the phone next to your computer
5. Click **Start agent**
6. Speak (as the caller) — the app will transcribe, reply, and speak back

---

## Known MVP limitations

- **Acoustic bridge only** — no phone/Twilio integration
- **No VAD** — the mic records in fixed 4-second chunks; short silences are sent to Whisper and return empty transcripts (handled gracefully)
- **Latency** — each turn takes ~2–4 seconds (network + API calls)
- **Echo risk** — the mic suppression relies on stopping/restarting the recorder; with very loud speakers some echo may still occur
- **No persistence** — transcript is in-memory only; refreshing resets everything
- **Single user** — designed for one person, one call
- **API costs** — each turn calls Whisper + GPT-4o-mini + TTS; costs are small but non-zero

---

## Future improvements

- Voice activity detection (VAD) for smarter turn-taking
- Stream GPT responses for lower perceived latency
- Configurable system prompt in the UI
- Call recording / transcript export
- Visual waveform during listening
