import { ChromaClient } from "chromadb";

const client = new ChromaClient({
  host: "localhost",
  port: 8000,
  ssl: false
});

const collection =
  await client.getCollection({
    name: "movies"
  });

console.log(
  await collection.count()
);