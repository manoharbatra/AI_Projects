// Create
import fs from "fs/promises"

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"

import { ChromaClient } from "chromadb"

import { getEmbedding } from "./embeddings.js"

// Load Function
async function main() {
    const client = new ChromaClient({
        host: "localhost",
        port: 8000,
        ssl: false,
    })

    const collection = await client.getOrCreateCollection({
        name: "resume",
    })

    const text = await fs.readFile("./files/resume.txt", "utf8")

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 80,
        chunkOverlap: 10,
    })

    const chunks = await splitter.createDocuments([text])

    console.log("Total Chunks:", chunks.length)

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i].pageContent

        const embedding = await getEmbedding(chunk)

        await collection.add({
            ids: [`chunk-${i}`],

            documents: [chunk],

            embeddings: [embedding],
        })

        console.log(`Inserted chunk ${i}`)
    }
}

main()
