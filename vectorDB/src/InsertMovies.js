import { ChromaClient } from "chromadb";

const client = new ChromaClient({
  host: "localhost",
  port: 8000,
  ssl: false
});

const collection =
  await client.getOrCreateCollection({
    name: "movies"
  });

await collection.add({
  ids: [
    "1",
    "2",
    "3"
  ],

  documents: [
    "Interstellar is about space exploration and black holes",
    "Titanic is a romantic drama",
    "The Martian is about survival on Mars"
  ]
});

console.log("Inserted");