import { movies } from "./movies.js";
import { getEmbedding } from "./embeddings.js";

// --------------------
// Cosine Similarity
// --------------------

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

async function main() {

  console.log(
    "Generating movie embeddings..."
  );

  const movieVectors = [];

  for (const movie of movies) {

    const embedding =
      await getEmbedding(
        movie.description
      );

    movieVectors.push({
      ...movie,
      embedding,
    });
  }

  const favoriteMovie =
    "Interstellar";

  const selectedMovie =
    movieVectors.find(
      (movie) =>
        movie.title ===
        favoriteMovie
    );

  if (!selectedMovie) {
    throw new Error(
      "Movie not found"
    );
  }

  const recommendations =
    movieVectors
      .filter(
        (movie) =>
          movie.title !==
          favoriteMovie
      )
      .map((movie) => ({
        title:
          movie.title,

        score:
          cosineSimilarity(
            selectedMovie.embedding,
            movie.embedding
          ),
      }))
      .sort(
        (a, b) =>
          b.score - a.score
      );

  console.log(
    `\nRecommendations for ${favoriteMovie}\n`
  );

  recommendations
    .slice(0, 3)
    .forEach((movie) => {

      console.log(
        `${movie.title} (${movie.score.toFixed(
          3
        )})`
      );
    });
}

main();