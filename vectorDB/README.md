# VectorDB Demo with Chroma

This project demonstrates a simple vector database workflow using the `chromadb` JavaScript client.
It stores, queries, and manages a small movie collection using a locally running Chroma server.

## Project Structure

- `package.json` - project metadata and dependencies
- `src/Basic.js` - basic Chroma client setup example (project entrypoint)
- `src/InsertMovies.js` - add movie documents to the `movies` collection
- `src/CreateCollection.js` - create or get the `movies` collection
- `src/SearchMovies.js` - search the `movies` collection for matching documents
- `src/CountDocuments.js` - count documents in the collection

## Dependencies

- `chromadb` - Chroma JavaScript client
- `@chroma-core/default-embed` - default embedding provider used by Chroma

## Requirements

- Node.js 20+ (project sets `type: module`)
- A running Chroma HTTP server on `localhost:8000`

## Recommended Setup

1. Install dependencies:

```bash
npm install
```

2. Start a Chroma server that listens on port `8000`.

If Docker is available:

```bash
docker run -d --name chromadb -p 8000:8000 chromadb/chroma
```

> Note: the Chroma npm CLI currently has a Windows x64 limitation, so this project uses the JavaScript client directly.

## How to Use

### Create or open a collection

```bash
node src/CreateCollection.js
```

### Insert movie documents

```bash
node src/InsertMovies.js
```

### Search the collection

```bash
node src/SearchMovies.js
```

### Run the default example

```bash
npm start
```

## What this project shows

- connecting to a local Chroma server with `ChromaClient`
- creating or retrieving a collection named `movies`
- inserting text documents into the collection
- querying the collection for nearest matches

## Notes

- The project is configured for `ssl: false` and `host: "localhost"`.
- Make sure the Chroma server is running before executing the scripts.
- If Docker is not available, use another Chroma-compatible server instance on port `8000`.
