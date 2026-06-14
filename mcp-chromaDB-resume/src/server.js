import { Server }
from "@modelcontextprotocol/sdk/server/index.js";

import { StdioServerTransport }
from "@modelcontextprotocol/sdk/server/stdio.js";

import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
}
from "@modelcontextprotocol/sdk/types.js";

import { searchResume }
from "./searchResume.js";

const server =
  new Server(
    {
      name: "resume-search-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

server.setRequestHandler(
  ListToolsRequestSchema,
  async () => ({
    tools: [
      {
        name: "search_resume",
        description:
          "Search resume using semantic search",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
            },
          },
          required: ["query"],
        },
      },
    ],
  })
);

server.setRequestHandler(
  CallToolRequestSchema,
  async (request) => {

    if (
      request.params.name ===
      "search_resume"
    ) {

      const query =
        request.params.arguments.query;

      const result =
        await searchResume(query);

      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    }

    throw new Error(
      "Unknown Tool"
    );
  }
);

const transport =
  new StdioServerTransport();

await server.connect(
  transport
);

console.error(
  "Resume Search MCP Started"
);