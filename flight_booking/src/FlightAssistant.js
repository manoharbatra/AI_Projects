// Load environment variables from a .env file for local development.
import "dotenv/config"

// Import the Groq SDK client to call the LLM service.
import Groq from "groq-sdk"

// Initialize Groq with the API key stored in process.env.
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
})

// A mock function to return available flight options for a route.
function getAvailableFlights(departure, destination) {
    console.log("Getting available flights")

    if (departure === "SFO" && destination === "LAX") {
        return ["UA 123", "AA 456"]
    }

    if (departure === "DFW" && destination === "LAX") {
        return ["AA 789"]
    }

    // Fallback when no predefined flights are available.
    return ["NO_FLIGHTS"]
}

// A mock function that simulates reserving a flight by flight number.
function reserveFlight(flightNumber) {
    console.log(`Reserving flight ${flightNumber}`)

    if (flightNumber.length === 6) {
        return "123456"
    }

    // If the flight number is invalid, return a booked status.
    return "FULLY_BOOKED"
}

// The conversation history that is sent to the assistant.
const messages = [
    {
        role: "system",
        content: "You are a helpful flight booking assistant.",
    },
]

// Main chat processing function.
async function processChat() {
    const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0,
        tools: [
            {
                type: "function",
                function: {
                    name: "getAvailableFlights",
                    description: "Returns available flights between two airports",
                    parameters: {
                        type: "object",
                        properties: {
                            departure: {
                                type: "string",
                            },
                            destination: {
                                type: "string",
                            },
                        },
                        required: ["departure", "destination"],
                    },
                },
            },
            {
                type: "function",
                function: {
                    name: "reserveFlight",
                    description: "Reserve a flight",
                    parameters: {
                        type: "object",
                        properties: {
                            flightNumber: {
                                type: "string",
                            },
                        },
                        required: ["flightNumber"],
                    },
                },
            },
        ],
        tool_choice: "auto",
    })

    const assistantMessage = response.choices[0].message

    // If the assistant decided to call a tool, run the corresponding local function.
    if (assistantMessage.tool_calls?.length) {
        messages.push(assistantMessage)

        for (const toolCall of assistantMessage.tool_calls) {
            const fnName = toolCall.function.name
            const args = JSON.parse(toolCall.function.arguments)
            let result

            if (fnName === "getAvailableFlights") {
                result = getAvailableFlights(args.departure, args.destination)
            }

            if (fnName === "reserveFlight") {
                result = reserveFlight(args.flightNumber)
            }

            messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify(result),
            })
        }

        // Ask the assistant again after the tool result is added to the conversation.
        const finalResponse = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages,
        })

        console.log("\nAssistant:")
        console.log(finalResponse.choices[0].message.content)
    } else {
        // If no tool call is needed, simply print the assistant reply.
        console.log("\nAssistant:")
        console.log(assistantMessage.content)
    }
}

console.log("Flight Assistant Started")
console.log("Example: Find flights from SFO to LAX")

// Listen for user input from stdin and send it to the assistant.
process.stdin.on("data", async (input) => {
    const userInput = input.toString().trim()

    messages.push({
        role: "user",
        content: userInput,
    })

    await processChat()
})
