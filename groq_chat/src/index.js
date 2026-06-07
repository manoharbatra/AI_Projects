import "dotenv/config"; // Load environment variables from .env
import readline from "readline"; // CLI input/output helper

// The Groq API key must be defined in the environment.
const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.error("GROQ_API_KEY is required");
  process.exit(1);
}

// Chat completions endpoint for the Groq OpenAI-compatible API.
const endpoint = "https://api.groq.com/openai/v1/chat/completions";

// The model used for the chat session.
const model = "llama-3.3-70b-versatile";
// Other good models:
// "llama3-8b-8192"
// "mixtral-8x7b-32768"

// Set up readline for a simple command-line chat interface.
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "You> ",
});

// Initialize the conversation with a system prompt.
const conversation = [
  {
    role: "system",
    content: "You are a friendly AI assistant. Answer clearly and helpfully.",
  },
];

// Send a message to the Groq chat endpoint and return the assistant response.
async function sendMessage(text) {
  conversation.push({
    role: "user",
    content: text,
  });

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      // Pass the full conversation history, including the system prompt,
      // all user messages, and assistant replies, so the model keeps context.
      messages: conversation,
      temperature: 0.7,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Groq API Error");
  }

  const answer = data.choices?.[0]?.message?.content;

  if (!answer) {
    throw new Error("No response received");
  }

  // Store the assistant answer in the conversation history.
  conversation.push({
    role: "assistant",
    content: answer,
  });

  console.log("\nConversation History:");
  console.log(JSON.stringify(conversation, null, 2));

  return answer;
}

console.log("Groq Chat Started");
console.log("Type 'exit' to quit");

rl.prompt();

// Handle each line of user input.
rl.on("line", async (line) => {
  const text = line.trim();

  if (!text) {
    rl.prompt();
    return;
  }

  if (text.toLowerCase() === "exit" || text.toLowerCase() === "quit") {
    rl.close();
    return;
  }

  try {
    const answer = await sendMessage(text);
    console.log(`AI> ${answer}`);
  } catch (err) {
    console.error("Error:", err.message);
  }

  rl.prompt();
});

// Cleanly exit on close.
rl.on("close", () => {
  console.log("Goodbye!");
  process.exit(0);
});