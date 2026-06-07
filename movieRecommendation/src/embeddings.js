/*
  embeddings.js

  Provides a reusable function to convert text into a numerical embedding vector.
  This uses the Xenova Transformers feature-extraction pipeline with the
  `Xenova/all-MiniLM-L6-v2` model. The extractor is initialized once and reused
  for later calls, which improves performance.

  Exported function:
    getEmbedding(text) -> Promise<number[]>
      - text: input string to vectorize
      - returns: normalized mean-pooled embedding values
*/

import { pipeline } from "@xenova/transformers";

let extractor;

export async function getEmbedding(text) {

  if (!extractor) {

    extractor = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }

  const output =
    await extractor(text, {
      pooling: "mean",
      normalize: true,
    });

  return Array.from(output.data);
}