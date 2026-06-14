import { Server } from "@modelcontextprotocol/sdk/server/index.js"

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"

import {
    ListToolsRequestSchema,
    CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js"

import { readFileContent } from "./fileReader.js"

const server = new Server(
    {
        name: "file-reader-server",

        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    },
)

server.setRequestHandler(
    ListToolsRequestSchema,

    async () => {
        return {
            tools: [
                {
                    name: "read_file",

                    description: "Read text file contents",

                    inputSchema: {
                        type: "object",

                        properties: {
                            fileName: {
                                type: "string",

                                description: "File name including extension",
                            },
                        },

                        required: ["fileName"],
                    },
                },
            ],
        }
    },
)

server.setRequestHandler(
    CallToolRequestSchema,

    async (request) => {
        if (request.params.name === "read_file") {
            const fileName = request.params.arguments.fileName

            const content = await readFileContent(fileName)

            return {
                content: [
                    {
                        type: "text",

                        text: content,
                    },
                ],
            }
        }

        throw new Error("Unknown Tool")
    },
)

const transport = new StdioServerTransport()

await server.connect(transport)

console.error("File Reader MCP Started")
