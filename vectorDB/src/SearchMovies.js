import { ChromaClient } from "chromadb";

// Create a Chroma client that connects to a local Chroma HTTP server
const client = new ChromaClient({
  host: "localhost",
  port: 8000,
  ssl: false,
});

async function main() {
  // Get the existing "movies" collection from Chroma
  const collection = await client.getCollection({
    name: "movies",
  });

  // Text query to search for in the collection
  const query = "space movie";

  // Query the collection and return the top 3 results
  const results = await collection.query({
    queryTexts: [query],
    nResults: 3,
  });

  // Display the query string
  console.log(`\nSearch Query: ${query}\n`);

  // Print each returned document in ranked order
  results.documents[0].forEach((doc, index) => {
    console.log(`${index + 1}. ${doc}`);
  });
}

main().catch(console.error);
