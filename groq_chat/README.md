# google_chat

A simple Node.js command-line chat app that uses the Groq OpenAI-compatible API.

## Setup

1. Install dependencies:

```bash
cd google_chat
npm install
```

2. Provide your Groq API key. The app expects `GROQ_API_KEY` in the environment or in a `.env` file.

Temporarily for the current PowerShell session:

```powershell
$env:GROQ_API_KEY = "your_api_key_here"
```

Permanently on Windows (set for future sessions):

```powershell
setx GROQ_API_KEY "your_api_key_here"
```

You can also create a `.env` file with:

```
GROQ_API_KEY=your_api_key_here
```
# Current Flow
User Input
   ↓
Groq API
   ↓
LLM generates answer from training data + chat history


## How it works

- Loads environment variables from `.env` via `dotenv`.
- Starts a command-line interface with `readline` and keeps a conversation history.
- Posts the conversation to the Groq chat completions endpoint `https://api.groq.com/openai/v1/chat/completions`.
- Prints the assistant reply and continues the interactive session.

The implementation is in `src/index.js` and requires the `GROQ_API_KEY` environment variable.

## Run

```bash
npm start
```

## Usage

Type a message and press Enter. Type `exit` or `quit` to end the session.

## Notes

- The default model used by the app is specified in `src/index.js` (e.g. `llama-3.3-70b-versatile`).
- If you intended to use Google's Gemini or another provider, update `src/index.js` accordingly.
