import "dotenv/config";
import fs from "fs";
import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(
  process.env.HF_API_KEY
);

async function generateImage() {
  try {

    const image = await client.textToImage({
      model: "black-forest-labs/FLUX.1-schnell",

      inputs:
        "A futuristic Indian cyberpunk city at night with flying cars, ultra realistic, cinematic lighting",

      parameters: {
        num_inference_steps: 30,
        guidance_scale: 7.5,
      },
    });

    const buffer = Buffer.from(
      await image.arrayBuffer()
    );

    fs.writeFileSync(
      "./output/generated-image.png",
      buffer
    );

    console.log(
      "Image generated successfully!"
    );

  } catch (error) {
    console.error(
      "Image generation failed:",
      error.message
    );
  }
}

generateImage();