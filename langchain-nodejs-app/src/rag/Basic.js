import "dotenv/config"

// Groq chat model integration from LangChain.
import { ChatGroq } from "@langchain/groq"
// In-memory vector store for storing embeddings and similarity search.
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory"

// Document wrapper used by LangChain to represent text data.
import { Document } from "@langchain/core/documents"

// Transformer pipeline used for embedding text locally.
import { pipeline } from "@xenova/transformers"

// Example text data we will store in the vector database.
const myData = [
    "My name is Manohar",
    "I love to eat pizza",
    "I love to eat pasta",
    "I live in Noida",
]

class LocalEmbeddings {
    // Build embeddings for a list of documents.
    async embedDocuments(texts) {
        const extractor = await pipeline(
            "feature-extraction",
            "Xenova/all-MiniLM-L6-v2",
        )

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

    // Embed a single query so it can be searched against the vector store.
    async embedQuery(text) {
        const extractor = await pipeline(
            "feature-extraction",
            "Xenova/all-MiniLM-L6-v2",
        )

        const output = await extractor(text, {
            pooling: "mean",
            normalize: true,
        })

        return Array.from(output.data)
    }
}

async function main() {
    // Convert raw text into LangChain Document objects.
    const docs = myData.map(
        (text) =>
            new Document({
                pageContent: text,
            }),
    )

    // Use the local embedding class to compute vector representations.
    const embeddings = new LocalEmbeddings()

    // Create an in-memory vector store from the documents and embeddings.
    const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings)

    const question = "What does Manohar loves to eat?"

    const relevantDocs = await vectorStore.similaritySearch(question, 4)

    console.log(relevantDocs.map((d) => d.pageContent))

    //     const docsWithScores =
    //   await vectorStore.similaritySearchWithScore(
    //     question,
    //     4
    //   );

    // console.log(docsWithScores);

    const context = relevantDocs.map((doc) => doc.pageContent).join("\n")

    const llm = new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,

        model: "llama-3.3-70b-versatile",
    })

    const response = await llm.invoke(`
Answer only from context.

Context:
${context}

Question:
${question}
`)

    // Print the retrieved context plus the model answer.
    console.log("\nRetrieved Docs:\n")

    console.log(context)

    console.log("\nAnswer:\n")

    console.log(response.content)
}

main()
