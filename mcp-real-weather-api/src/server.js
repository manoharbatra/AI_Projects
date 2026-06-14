import { Server }
from "@modelcontextprotocol/sdk/server/index.js";

import {
  StdioServerTransport
}
from "@modelcontextprotocol/sdk/server/stdio.js";

import {
  ListToolsRequestSchema,
  CallToolRequestSchema
}
from "@modelcontextprotocol/sdk/types.js";

import {
  getWeather
}
from "./weather.js";

const server =
  new Server(
    {
      name:
        "weather-server",

      version:
        "1.0.0"
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

server.setRequestHandler(

  ListToolsRequestSchema,

  async () => {

    return {

      tools: [
        {
          name:
            "get_weather",

          description:
            "Get current weather for a city",

          inputSchema: {

            type:
              "object",

            properties: {

              city: {
                type:
                  "string",

                description:
                  "City name"
              }
            },

            required: [
              "city"
            ]
          }
        }
      ]
    };
  }
);

server.setRequestHandler(

  CallToolRequestSchema,

  async (request) => {

    if (
      request.params.name ===
      "get_weather"
    ) {

      const city =
        request.params.arguments.city;

      const weather =
        await getWeather(
          city
        );

      return {

        content: [
          {
            type:
              "text",

            text:
              JSON.stringify(
                weather,
                null,
                2
              )
          }
        ]
      };
    }

    throw new Error(
      "Unknown tool"
    );
  }
);

const transport =
  new StdioServerTransport();

await server.connect(
  transport
);

console.error(
  "Weather MCP Server Started"
);