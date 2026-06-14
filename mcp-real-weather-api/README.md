# MCP Real Weather API

Lightweight Model Context Protocol (MCP) tool server that returns real-time weather data using Open-Meteo APIs. The server exposes a single MCP tool named `get_weather` which accepts a `city` string and returns current temperature, humidity, and wind speed.

**Files**
- [src/server.js](src/server.js#L1-L200): MCP server implementation (stdio transport).
- [src/weather.js](src/weather.js#L1-L200): Fetches weather data using Open-Meteo.
- [src/geo.js](src/geo.js#L1-L200): Geocoding helper (Open-Meteo geocoding API).

## Prerequisites
- Node.js (recommended v18+)
- Internet access to call Open-Meteo APIs

## Install
From the project root run:

```bash
npm install
```

## Run
Start the MCP server (it uses stdin/stdout transport):

```bash
npm start
```

You should see a startup message on stderr:

```
Weather MCP Server Started
```

## Tool: `get_weather`
- Description: Get current weather for a city
- Input: `{ "city": "City Name" }`
- Output: JSON object with fields:
  - `city` — requested city name
  - `temperature` — current temperature (°C)
  - `humidity` — relative humidity (%)
  - `windSpeed` — wind speed (m/s)

Example response:

```json
{
  "city": "Delhi",
  "temperature": 34.2,
  "humidity": 45.1,
  "windSpeed": 3.4
}
```

## Quick local test
You can call the internal helper directly from node for a quick check (requires `npm install` first):

```bash
node --input-type=module -e "import('./src/weather.js').then(m=>m.getWeather('Delhi').then(res=>console.log(res)).catch(err=>console.error(err)))"
```

## Notes
- This project uses Open-Meteo's free APIs (no API key required). Be mindful of rate limits for heavy usage.
- If a city cannot be found by the geocoding endpoint, the server will return an error indicating `City not found`.
- The server is intended as a demo / local tool provider for MCP-compatible clients.

If you'd like, I can add example client code that calls the MCP server over stdio or expand the README with usage examples for specific MCP clients.