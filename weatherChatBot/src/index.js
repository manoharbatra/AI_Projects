// Load environment variables from .env file
import "dotenv/config";
// For creating interactive command-line interface
import readline from "readline";
// For making HTTP requests to weather API
import axios from "axios";

// Retrieve API keys from environment variables
const groqApiKey = process.env.GROQ_API_KEY;
const weatherApiKey = process.env.WEATHER_API_KEY;

// Validate that required API keys are present
if (!groqApiKey) {
  console.error("GROQ_API_KEY missing");
  process.exit(1);
}

if (!weatherApiKey) {
  console.error("WEATHER_API_KEY missing");
  process.exit(1);
}

// Groq API endpoint for chat completions
const endpoint =
  "https://api.groq.com/openai/v1/chat/completions";

// LLM model to use for generating responses
const model = "llama-3.3-70b-versatile";

// Create readline interface for interactive user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "You> ",
});

// Initialize conversation history with system message that defines AI behavior
const conversation = [
  {
    role: "system",
    content:
      "You are a smart helpful AI assistant. If weather data is provided, explain it naturally.",
  },
];

// Fetch real-time weather data for a given city using OpenWeather API
async function getWeather(city) {
  const url =
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`;

  const response = await axios.get(url);

  return response.data;
}

// Check if user's message contains weather-related keywords
function detectWeatherIntent(text) {
  return (
    text.toLowerCase().includes("weather") ||
    text.toLowerCase().includes("temperature")
  );
}

// Extract city name from message (expects format: "... in CityName")
function extractCity(text) {
  const words = text.split("in ");
  return words[1]?.trim();
}

// Send conversation to Groq API and get AI-generated response
async function askGroq(message) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${groqApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: conversation,
      temperature: 0.7,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message || "Groq API Error"
    );
  }

  return data.choices?.[0]?.message?.content;
}

// Main function to handle user messages and generate AI responses
async function sendMessage(text) {
  // Add user message to conversation history
  conversation.push({
    role: "user",
    content: text,
  });

  // Check if user is asking for weather information
  if (detectWeatherIntent(text)) {
    const city = extractCity(text);

    if (city) {
      try {
        // Fetch weather data for the extracted city
        const weather = await getWeather(city);

        // Format weather data into a readable summary
        const weatherSummary = `
City: ${weather.name}
Temperature: ${weather.main.temp}°C
Feels Like: ${weather.main.feels_like}°C
Humidity: ${weather.main.humidity}%
Condition: ${weather.weather[0].description}
`;

        // Add weather data to conversation context for AI to use
        conversation.push({
          role: "system",
          content:
            `Real-time weather data:\n${weatherSummary}`,
        });

      } catch (err) {
        console.log("Weather API failed");
      }
    }
  }

  // Get AI response from Groq API
  const answer = await askGroq();

  // Add AI response to conversation history
  conversation.push({
    role: "assistant",
    content: answer,
  });

  return answer;
}

// Display welcome message and usage examples
console.log("================================");
console.log(" Groq AI Chat Started");
console.log("================================");
console.log("Examples:");
console.log("- hi");
console.log("- weather in Delhi");
console.log("- temperature in Mumbai");
console.log("- explain React hooks");
console.log("Type 'exit' to quit");
console.log("================================");

// Show initial prompt
rl.prompt();

// Handle user input from command line
rl.on("line", async (line) => {
  const text = line.trim();

  // Skip empty input
  if (!text) {
    rl.prompt();
    return;
  }

  // Exit application if user types 'exit' or 'quit'
  if (
    text.toLowerCase() === "exit" ||
    text.toLowerCase() === "quit"
  ) {
    rl.close();
    return;
  }

  try {
    // Process user message and get AI response
    const answer = await sendMessage(text);

    console.log(`\nAI> ${answer}\n`);

  } catch (err) {
    console.error("\nError:", err.message);
  }

  // Show prompt for next user input
  rl.prompt();
});

// Handle graceful shutdown when user closes the interface
rl.on("close", () => {
  console.log("Goodbye!");
  process.exit(0);
});