// Import the Google Text-to-Speech wrapper
import gTTS from "gtts";
// Read user input from the terminal
import readline from "readline";
// Access the filesystem for output file creation
import fs from "fs";

// Create a command-line prompt interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Ensure the output directory exists before saving audio
if (!fs.existsSync("./output")) {
  fs.mkdirSync("./output");
}

console.log("================================");
console.log(" AI Text To Speech Generator");
console.log("================================");

// Ask the user for text to convert to speech
rl.question("Enter text: ", (text) => {
  // Validate that the user entered non-empty text
  if (!text.trim()) {
    console.log("Text is required");
    rl.close();
    return;
  }

  // Language codes supported by gTTS
  // en = English
  // hi = Hindi
  const gtts = new gTTS(text, "en");

  // Save the generated audio to an MP3 file
  gtts.save("./output/speech.mp3", function (err) {
    if (err) {
      console.error("TTS Failed:", err);
      rl.close();
      return;
    }

    console.log("\nSpeech generated successfully!");
    console.log("Saved at: output/speech.mp3");
    rl.close();
  });
});