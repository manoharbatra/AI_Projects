import "dotenv/config"

// File system module for reading PDF files.
import fs from "fs"
// Library for extracting text from PDF documents.
import pdf from "pdf-parse"

// LangChain Groq chat model wrapper.
import { ChatGroq } from "@langchain/groq"
// Document abstraction for text pieces in the vector store.
import { Document } from "@langchain/core/documents"
// Utility to split long text into manageable chunks.
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
// In-memory vector store for embeddings.
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory"
// Local transformer pipeline for generating embeddings.
import { pipeline } from "@xenova/transformers"

// --------------------------------
// Local Embeddings
// --------------------------------

class LocalEmbeddings {
    constructor() {
        // Load and cache the embedding model for reuse.
        this.extractorPromise = pipeline(
            "feature-extraction",
            "Xenova/all-MiniLM-L6-v2",
        )
    }

    async embedDocuments(texts) {
        // Generate embeddings for a batch of document chunks.
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
        // Embed a user query using the same model.
        const extractor = await this.extractorPromise

        const output = await extractor(text, {
            pooling: "mean",
            normalize: true,
        })

        return Array.from(output.data)
    }
}

// --------------------------------
// Main
// --------------------------------

async function main() {
    // -----------------------------
    // Load PDF
    // -----------------------------

    const pdfBuffer = fs.readFileSync("./data/sample.pdf")

    const pdfData = await pdf(pdfBuffer)

    const pdfText = pdfData.text

    console.log("\nPDF Content:\n")

    console.log(pdfText.substring(0, 500))

    // Wrap the PDF text in a LangChain Document.
    // ----------------------------------
    // Create Documents
    // -----------------------------

    const docs = [
        new Document({
            pageContent: pdfText,
        }),
    ]

    // -----------------------------
    // Split Documents
    // -----------------------------

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 300,
        chunkOverlap: 50,
    })

    const splitDocs = await splitter.splitDocuments(docs)

    console.log(`\nCreated ${splitDocs.length} chunks`)

    // -----------------------------
    // Embeddings
    // -----------------------------

    const embeddings = new LocalEmbeddings()

    // Build the vector store from chunks and their embeddings.
    // ----------------------------------
    // Vector Store
    // -----------------------------

    const vectorStore = await MemoryVectorStore.fromDocuments(
        splitDocs,
        embeddings,
    )

    // -----------------------------
    // Question
    // -----------------------------

    const question = "What are Manohar's skills?"

    const retrievedDocs = await vectorStore.similaritySearch(question, 3)

    console.log("\nRetrieved Chunks:\n")

    retrievedDocs.forEach((doc, index) => {
        console.log(`\nChunk ${index + 1}`)

        console.log(doc.pageContent)
    })

    // -----------------------------
    // Context
    // -----------------------------

    const context = retrievedDocs.map((doc) => doc.pageContent).join("\n")

    // Build prompt context from the retrieved chunks.
    // ----------------------------------
    // LLM
    // -----------------------------

    // Initialize the Groq chat model with zero temperature for deterministic answers.
    const llm = new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,

        model: "llama-3.3-70b-versatile",

        temperature: 0,
    })

    const response = await llm.invoke(`
Answer only from context.

Context:
${context}

Question:
${question}
`)

    console.log("\n=====================")

    console.log("ANSWER")

    console.log("=====================\n")

    // Print the model's answer based on the retrieved context.
    console.log(response.content)
}

// Run the main function and catch any errors.
main().catch(console.error)
