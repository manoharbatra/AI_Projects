// Load environment variables from a .env file
import "dotenv/config"

// Read user input from the terminal
import readline from "readline"

// LangChain Groq chat wrapper for Groq API
import { ChatGroq } from "@langchain/groq"

// Prompt template builder from LangChain core
import { ChatPromptTemplate } from "@langchain/core/prompts"

// Initialize the Groq chat model with API key and options
const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
})

// Build the prompt template using system and human messages
const promptTemplate = ChatPromptTemplate.fromMessages([
    [
        "system",
        `You are an expert AI career mentor
      helping software engineers.`,
    ],
    ["human", "{input}"],
])

// Connect the prompt template to the model as a simple chain
const chain = promptTemplate.pipe(model)

// Create a readline interface for interactive chat
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "You> ",
})

console.log("================================")
console.log(" LangChain + Groq AI Chat")
console.log("================================")
console.log("Type 'exit' to quit")
console.log("================================")

// Show the initial prompt to the user
rl.prompt()

// Handle each line entered by the user
rl.on("line", async (line) => {
    const text = line.trim()

    // Exit when the user types 'exit'
    if (text.toLowerCase() === "exit") {
        rl.close()
        return
    }

    try {
        // Invoke the LangChain prompt chain with user input
        const response = await chain.invoke({
            input: text,
        })

        // Print the AI's response content
        console.log(`\nAI> ${response.content}\n`)
    } catch (err) {
        console.error("Error:", err.message)
    }

    // Prompt again for the next user message
    rl.prompt()
})

// Graceful shutdown when the user quits
rl.on("close", () => {
    console.log("Goodbye!")
    process.exit(0)
})
