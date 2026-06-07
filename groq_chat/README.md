# Groq Chat

A simple Node.js command-line chat application powered by the [Groq API](https://console.groq.com/). Chat with a friendly AI assistant using the Llama 3.3-70b model with low-latency responses.

## Features

- 🚀 Fast inference with Groq's API
- 💬 Multi-turn conversation with context awareness
- 🤖 Uses Llama 3.3-70b model (or other Groq models)
- 📝 Simple command-line interface
- 🔐 Environment-based API key management

## Prerequisites

- Node.js 18+ 
- A Groq API key (get one for free at [console.groq.com](https://console.groq.com/))

## Installation

1. Install dependencies:

```bash
npm install
```

2. Set up your Groq API key. Create a `.env` file in the project root:

```
GROQ_API_KEY=your_api_key_here
```

**Alternative setup methods:**

Temporarily for the current PowerShell session:

```powershell
$env:GROQ_API_KEY = "your_api_key_here"
```

Permanently on Windows (set for future sessions):

```powershell
setx GROQ_API_KEY "your_api_key_here"
```

## Usage

Start the chat application:

```bash
npm start
```

Once running, type your messages at the prompt:

```
Groq Chat Started
Type 'exit' to quit
You> Hello, how are you?
AI> I'm doing great, thank you for asking! How can I help you today?
You> Tell me a joke
AI> Why don't scientists trust atoms? Because they make up everything!
You> exit
```

Type `exit` or `quit` to end the conversation.

## Available Models

The default model is `llama-3.3-70b-versatile`. You can change it in `src/index.js`:

```javascript
const model = "llama-3.3-70b-versatile";
// Other options:
// "llama3-8b-8192"
// "mixtral-8x7b-32768"
```

Check the [Groq API documentation](https://console.groq.com/docs) for the full list of available models.

## How it Works

```
User Input
   ↓
Groq API (OpenAI-compatible endpoint)
   ↓
LLM generates answer from training data + chat history
   ↓
Response displayed in CLI
```

The implementation:

- Loads environment variables from `.env` via `dotenv`
- Starts a command-line interface with `readline` and maintains conversation history
- Posts the conversation to the Groq chat completions endpoint: `https://api.groq.com/openai/v1/chat/completions`
- Prints the assistant reply and continues the interactive session
- Implementation is in `src/index.js`

## Configuration

- **Model**: Edit `src/index.js` line 16 to change the AI model
- **Temperature**: Adjust line 50 to control response randomness (0.0-2.0, default 0.7)
- **System Prompt**: Modify line 31 to customize the AI assistant's behavior

## Project Structure

```
groq_chat/
├── src/
│   └── index.js      # Main chat application
├── package.json      # Dependencies and scripts
└── README.md         # This file
```

## Dependencies

- **dotenv**: Environment variable management

## Troubleshooting

**"GROQ_API_KEY is required"**
- Ensure your `.env` file exists and contains a valid `GROQ_API_KEY`

**"Groq API Error"**
- Check that your API key is valid
- Verify you have sufficient API credits
- Check your internet connection

**No response received**
- The Groq API may be temporarily unavailable
- Try again in a few moments

## License

MIT

```bash
npm start
```

## Usage

Type a message and press Enter. Type `exit` or `quit` to end the session.

## Notes

- The default model used by the app is specified in `src/index.js` (e.g. `llama-3.3-70b-versatile`).
- If you intended to use Google's Gemini or another provider, update `src/index.js` accordingly.
