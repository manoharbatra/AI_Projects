import fs from "fs/promises"

import { Document } from "@langchain/core/documents"

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"

import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory"

import { getEmbedding } from "./embeddings.js"

// Create local embeddings wrapper
class LocalEmbeddings {
    async embedDocuments(texts) {
        return Promise.all(texts.map(getEmbedding))
    }

    async embedQuery(text) {
        return getEmbedding(text)
    }
}

// Now search:
export async function searchResume(query) {
    const resumeText = await fs.readFile("./files/resume.txt", "utf8")

    const docs = [
        new Document({
            pageContent: resumeText,
        }),
    ]

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 30,
        chunkOverlap: 10,
    })

    const chunks = await splitter.splitDocuments(docs)

    const vectorStore = await MemoryVectorStore.fromDocuments(
        chunks,
        new LocalEmbeddings(),
    )

    const results = await vectorStore.similaritySearch(query, 3)

    return results.map((doc) => doc.pageContent).join("\n\n")
}
