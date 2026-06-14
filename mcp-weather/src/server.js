// Import MCP Server core and transport implementation
import { Server } from "@modelcontextprotocol/sdk/server/index.js"

// Stdio transport lets the process communicate using stdin/stdout,
// which is convenient for local testing or when embedded in other
// processes that speak MCP over standard streams.
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"

// Types for MCP request schemas used to register handlers.
import {
    ListToolsRequestSchema,
    CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js"

// Local helper returning mock weather data.
import { getWeather } from "./weather.js"

// Create a new MCP Server with basic metadata.
const server = new Server(
    {
        name: "weather-server",

        version: "1.0.0",
    },
    {
        // Capabilities can be used to advertise supported features.
        capabilities: {
            tools: {},
        },
    },
)

// Register handler that lists available tools. MCP clients call this
// to discover what tools the server provides and the expected input
// schema for each tool.
server.setRequestHandler(
    ListToolsRequestSchema,

    async () => {
        return {
            tools: [
                {
                    // Tool identifier used by clients.
                    name: "get_weather",

                    // Simple description for humans and tooling.
                    description: "Get weather information for a city",

                    // JSON Schema describing tool input parameters.
                    inputSchema: {
                        type: "object",

                        properties: {
                            city: {
                                type: "string",
                                description: "City name",
                            },
                        },

                        required: ["city"],
                    },
                },
            ],
        }
    },
)

// Register handler that executes a named tool when called by a
// client. The request contains the tool name and arguments.
server.setRequestHandler(
    CallToolRequestSchema,

    async (request) => {
        if (request.params.name === "get_weather") {
            // Extract the `city` argument and call into our local
            // helper implementation.
            const city = request.params.arguments.city

            const weather = getWeather(city)

            // MCP responses can carry various content types. Here we
            // return the weather object as a pretty-printed JSON
            // string inside a text content block.
            return {
                content: [
                    {
                        type: "text",

                        text: JSON.stringify(weather, null, 2),
                    },
                ],
            }
        }

        // If the tool name is not recognized, throw an error so the
        // caller knows the request failed.
        throw new Error("Unknown tool")
    },
)

// Create and connect the transport. Using stdio keeps this server
// suitable for local demos and for integration with other MCP-aware
// processes/tools.
const transport = new StdioServerTransport()

await server.connect(transport)

// Write startup information to stderr so it is visible even if
// stdout is reserved for framed MCP messages.
console.error("Weather MCP Server Started")
