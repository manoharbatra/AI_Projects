# MCP Weather Server

A simple Model Context Protocol (MCP) tool server that exposes a single `get_weather` tool. This server responds with mock weather data for a city and can be used with MCP-compatible clients.

## Project structure

- `package.json` - Node.js package metadata and scripts.
- `src/server.js` - MCP server implementation using `@modelcontextprotocol/sdk`.
- `src/weather.js` - Mock weather lookup logic.

## Installation

From the project root:

```bash
npm install
```

## Run

Start the server with:

```bash
npm start
```

The server uses standard I/O transport and prints a startup message to stderr.

## Tool definition

The MCP server exposes one tool:

- `get_weather`
  - Description: Get weather information for a city
  - Input:
    - `city` (string) - City name

## Mocked weather responses

The current implementation returns data for these cities:

- `Delhi` - Sunny, 42°C
- `Noida` - Sunny, 40°C
- `Mumbai` - Rainy, 32°C

For other cities, the server returns:

- `temperature`: 30
- `condition`: `Unknown`

## Notes

- No tests are included in this project.
- The server is implemented as an MCP tool provider and is intended for local or demo usage.
