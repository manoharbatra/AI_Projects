import "dotenv/config";

import readline from "readline";
import Groq from "groq-sdk";

import { movies } from "./movies.js";
import { getEmbedding } from "./embeddings.js";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

function cosineSimilarity(a, b) {

  const dotProduct =
    a.reduce(
      (sum, val, i) =>
        sum + val * b[i],
      0
    );

  const magnitudeA =
    Math.sqrt(
      a.reduce(
        (sum, val) =>
          sum + val * val,
        0
      )
    );

  const magnitudeB =
    Math.sqrt(
      b.reduce(
        (sum, val) =>
          sum + val * val,
        0
      )
    );

  return (
    dotProduct /
    (magnitudeA * magnitudeB)
  );
}

async function extractIntent(
  userInput
) {

  const response =
    await groq.chat.completions.create({

      model:
        "llama-3.3-70b-versatile",

      temperature: 0,

      messages: [
        {
          role: "system",

          content:
            `Extract the movie preference from the user's request.

Return ONLY keywords.

Examples:

Input:
Suggest movies like Interstellar

Output:
space exploration science fiction survival

Input:
I want romantic movies

Output:
romance relationship drama`,
        },

        {
          role: "user",
          content: userInput,
        },
      ],
    });

  return response.choices[0]
    .message.content;
}

async function recommendMovies(
  userInput
) {

  console.log(
    "\nExtracting intent..."
  );

  const intent =
    await extractIntent(
      userInput
    );

  console.log(
    "\nIntent:"
  );

  console.log(intent);

  const queryEmbedding =
    await getEmbedding(intent);

  const results = [];

  for (const movie of movies) {

    const embedding =
      await getEmbedding(
        movie.description
      );

    const score =
      cosineSimilarity(
        queryEmbedding,
        embedding
      );

    results.push({
      title: movie.title,
      score,
    });
  }

  results.sort(
    (a, b) =>
      b.score - a.score
  );

  const topMovies =
    results.slice(0, 3);

  const finalResponse =
    await groq.chat.completions.create({

      model:
        "llama-3.3-70b-versatile",

      messages: [
        {
          role: "system",

          content:
            "You are a movie recommendation expert.",
        },

        {
          role: "user",

          content:
            `
User Request:
${userInput}

Recommended Movies:
${topMovies
  .map(
    (m) => m.title
  )
  .join(", ")}

Explain why these movies were recommended.
`,
        },
      ],
    });

  console.log(
    "\nRecommendations\n"
  );

  console.log(
    finalResponse
      .choices[0]
      .message.content
  );
}

const rl =
  readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

rl.question(
  "What movies do you like?\n",

  async (input) => {

    await recommendMovies(
      input
    );

    rl.close();
  }
);