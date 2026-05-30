// Load environment variables from a .env file
import "dotenv/config";

// Built-in filesystem module for reading/writing audio files
import fs from "fs";
// Record audio from the microphone (WAV PCM 16-bit)
import recorder from "node-record-lpcm16";
// Simple audio player wrapper for playing generated output
import player from "play-sound";
// Hugging Face inference client for TTS
import { InferenceClient } from "@huggingface/inference";
// Groq SDK for speech-to-text and chat completion APIs
import Groq from "groq-sdk";

// Initialize Groq client with API key from env
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Initialize Hugging Face inference client for TTS
const hf = new InferenceClient(
  process.env.HF_API_KEY
);

// Local audio player instance
const audioPlayer = player();

// Paths for storing temporary recordings and generated output
const RECORDING_PATH =
  "./recordings/input.wav";
const OUTPUT_AUDIO =
  "./output/output.mp3";

// Record audio from the default microphone for `seconds` seconds
async function recordAudio(seconds = 5) {
  console.log("🎤 Recording started...");

  // Create the destination file stream for the raw WAV data
  const file = fs.createWriteStream(
    RECORDING_PATH,
    { encoding: "binary" }
  );

  // Start recording with reasonable defaults for speech
  const recording = recorder.record({
    sampleRate: 16000,
    channels: 1,
    audioType: "wav",
  });

  // Pipe the incoming audio stream to disk
  recording.stream().pipe(file);

  // Wait for the requested duration, then stop
  await new Promise((resolve) =>
    setTimeout(resolve, seconds * 1000)
  );

  recording.stop();
  console.log("✅ Recording completed");
}

// Transcribe the recorded WAV file to text using Groq's Whisper model
async function speechToText() {
  console.log("📝 Converting speech to text...");

  const transcription =
    await groq.audio.transcriptions.create({
      file: fs.createReadStream(RECORDING_PATH),
      model: "whisper-large-v3",
    });

  // Log the transcribed text for visibility
  console.log(`You Said: ${transcription.text}`);
  return transcription.text;
}

// Send user text to Groq chat endpoint and return the assistant's reply
async function askAI(text) {
  console.log("🤖 Thinking...");

  const completion =
    await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are a helpful voice assistant." },
        { role: "user", content: text },
      ],
    });

  const answer = completion.choices[0].message.content;
  console.log(`AI: ${answer}`);
  return answer;
}

// Convert given text to speech using Hugging Face TTS model and save to disk
async function textToSpeech(text) {
  console.log("🔊 Generating voice...");

  const audio = await hf.textToSpeech({
    model: "facebook/mms-tts-eng",
    inputs: text,
  });

  // Convert the response to a Node Buffer and write to file
  const buffer = Buffer.from(await audio.arrayBuffer());
  fs.writeFileSync(OUTPUT_AUDIO, buffer);
  console.log("✅ Audio generated");
}

// Play the generated audio file using the system audio player
async function playAudio() {
  console.log("▶️ Playing audio...");

  return new Promise((resolve, reject) => {
    audioPlayer.play(OUTPUT_AUDIO, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Main flow: record -> transcribe -> ask AI -> synthesize -> play
async function main() {
  try {
    await recordAudio(5);
    const userText = await speechToText();
    const aiAnswer = await askAI(userText);
    await textToSpeech(aiAnswer);
    await playAudio();
    console.log("🎉 Done!");
  } catch (err) {
    console.error("Error:", err.message);
  }
}

// Run the assistant
main();