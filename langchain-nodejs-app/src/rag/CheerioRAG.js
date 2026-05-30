import "dotenv/config"

// HTTP client for fetching web pages.
import axios from "axios"
// HTML parser for extracting text from the page.
import * as cheerio from "cheerio"

// LangChain Groq chat model wrapper.
import { ChatGroq } from "@langchain/groq"
// Document abstraction for text pieces stored in the vector store.
import { Document } from "@langchain/core/documents"
// Utility to split long text into smaller chunks.
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
// In-memory vector store implementation.
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory"
// Local transformer pipeline for generating embeddings.
import { pipeline } from "@xenova/transformers"

// ----------------------------------
// Local Embeddings
// ----------------------------------

class LocalEmbeddings {
    constructor() {
        // Load the transformer once and reuse it for documents and queries.
        this.extractorPromise = pipeline(
            "feature-extraction",
            "Xenova/all-MiniLM-L6-v2",
        )
    }

    async embedDocuments(texts) {
        const extractor = await this.extractorPromise

        const embeddings = []

        for (const text of texts) {
            const output = await extractor(text, {
                pooling: "mean",
                normalize: true,
            })

            embeddings.push(Array.from(output.data))
        }

        return embeddings
    }

    async embedQuery(text) {
        const extractor = await this.extractorPromise

        const output = await extractor(text, {
            pooling: "mean",
            normalize: true,
        })

        return Array.from(output.data)
    }
}

// ----------------------------------
// Main
// ----------------------------------

async function main() {
    // URL of the site we will crawl and build a RAG index from.
    const url = "https://react.dev/learn"

    console.log("\nFetching Website...\n")

    const response = await axios.get(url)

    const html = response.data

    // ----------------------------------
    // Parse HTML
    // ----------------------------------

    const $ = cheerio.load(html)

    $("script").remove()
    $("style").remove()
    $("noscript").remove()

    const websiteText = $("body").text().replace(/\s+/g, " ").trim()

    console.log(`Website Text Length: ${websiteText.length}`)

    // Wrap the cleaned website text in a LangChain document.
    // This document can later be split and indexed.
    // ----------------------------------
    // Create Documents
    // ----------------------------------

    const docs = [
        new Document({
            pageContent: websiteText,
        }),
    ]

    // ----------------------------------
    // Split Documents
    // ----------------------------------

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 100,
    })

    const splitDocs = await splitter.splitDocuments(docs)

    console.log(`Created ${splitDocs.length} chunks`)

    // ----------------------------------
    // Embeddings
    // ----------------------------------

    const embeddings = new LocalEmbeddings()

    // Generate embedded vectors and add them to an in-memory store.
    // ----------------------------------
    // Vector Store
    // ----------------------------------

    const vectorStore = await MemoryVectorStore.fromDocuments(
        splitDocs,
        embeddings,
    )

    // ----------------------------------
    // User Question
    // ----------------------------------

    const question = "What is React?"

    const retrievedDocs = await vectorStore.similaritySearch(question, 4)

    console.log("\nRetrieved Chunks:\n")

    retrievedDocs.forEach((doc, index) => {
        console.log(`\nChunk ${index + 1}`)

        console.log(doc.pageContent.substring(0, 250))

        console.log("\n---------------------")
    })

    const context = retrievedDocs.map((doc) => doc.pageContent).join("\n")

    // Build the prompt context from retrieved chunks.
    // ----------------------------------
    // Groq
    // ----------------------------------

    const llm = new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,

        model: "llama-3.3-70b-versatile",

        temperature: 0,
    })

    const result = await llm.invoke(`
Answer ONLY from the provided context.

Context:
${context}

Question:
${question}
`)

    console.log("\n=======================")

    console.log("ANSWER")

    console.log("=======================\n")

    // Print the model's answer after the retrieved context.
    console.log(result.content)
}

main().catch(console.error)
