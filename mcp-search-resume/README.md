# MCP Resume Search

A Model Context Protocol (MCP) tool server that performs semantic search over a resume using local sentence embeddings. The server exposes a single tool called `search_resume` and returns the most relevant matching resume content for a query.

## Project structure

- `package.json` - project metadata and start script.
- `src/server.js` - MCP server implementation exposing `search_resume`.
- `src/resumeSearch.js` - search logic using LangChain and local embeddings.
- `src/embeddings.js` - embedding generation using `@xenova/transformers`.
- `files/resume.txt` - resume text source used for search.

## Prerequisites

- Node.js 18+ (or a modern Node version supporting ES modules)
- Internet access for `@xenova/transformers` and any model downloads

## Install

From the repo root:

```bash
npm install
```

## Run

Start the MCP server:

```bash
npm start
```

The server listens using stdio transport, so it is intended to be called by an MCP client over stdin/stdout.

## Tool: `search_resume`

- Description: Search resume using semantic search
- Input: `{ "query": "your search text" }`
- Output: text content from the most relevant resume chunk

Example tool usage:

```json
{
  "name": "search_resume",
  "arguments": {
    "query": "How many years of exp"
  }
}
```

## How it works

1. Read `files/resume.txt`.
2. Split the resume into text chunks using `RecursiveCharacterTextSplitter`.
3. Generate embeddings with a local `@xenova/transformers` pipeline.
4. Build an in-memory vector store and perform similarity search.
5. Return the top matched chunk.

## Notes

- The current implementation returns the top 3 chunks and joins them. For more focused results, adjust the chunking or return only the highest-ranked match.
- If you want a more precise single-sentence result, consider splitting the resume into individual lines or sentences before indexing.
