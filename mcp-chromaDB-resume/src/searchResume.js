// Create
import { ChromaClient } from "chromadb"

import { getEmbedding } from "./embeddings.js"

// Search Function
export async function searchResume(query) {
    const client = new ChromaClient({
        host: "localhost",
        port: 8000,
        ssl: false,
    })

    const collection = await client.getCollection({
        name: "resume",
    })

    const queryEmbedding = await getEmbedding(query)

    const results = await collection.query({
        queryEmbeddings: [queryEmbedding],

        nResults: 3,
    })

    return results.documents[0].join("\n\n")
}
