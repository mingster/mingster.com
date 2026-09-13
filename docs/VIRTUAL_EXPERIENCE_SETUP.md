# Virtual Companion Homepage – Setup

The homepage is an interactive 3D virtual companion with AI chat, voice (Edge TTS), and optional lip sync.

## Environment variables

- **`GOOGLE_GENERATIVE_AI_API_KEY`** or **`GEMINI_API_KEY`** (required for chat): Get a key at [Google AI Studio](https://aistudio.google.com/apikey).
- **`EDGE_TTS_VOICE`** (optional): Edge TTS voice (e.g. `en-US-JennyNeural`). Default works without it.
- **`RHUBARB_PATH`** (optional): Path to Rhubarb Lip Sync binary; default is `rhubarb` on PATH.
- **`DISABLE_LIP_SYNC`** (optional): Set to `true` to skip ffmpeg and Rhubarb (e.g. on Vercel). Voice still works; lip sync is disabled.

## Binaries (for full lip sync)

1. **ffmpeg**: Install on your system (e.g. `brew install ffmpeg`). Used to convert Edge TTS MP3 to WAV for Rhubarb.
2. **Rhubarb Lip Sync**: Download from [releases](https://github.com/DanielSWolf/rhubarb-lip-sync/releases). Place the binary in `web/bin/` or on PATH, or set `RHUBARB_PATH`.

On Vercel, ffmpeg and Rhubarb are not available; set `DISABLE_LIP_SYNC=true` so the app runs with voice but without lip sync.

## 3D models

See `web/public/models/README.md`. Optional: add `character.glb` and `animations.glb` for the full avatar; otherwise a placeholder capsule is shown.
