const { experimental_transcribe: transcribe } = require('ai');
const { openai } = require('@ai-sdk/openai');
const config = require('./config');

async function transcribeFile(fileBuffer) {
  const transcript = await transcribe({
    model: openai.transcription('gpt-4o-transcribe', {
      apiKey: config.openai.apiKey,
    }),
    audio: fileBuffer,
  });

  return transcript.text;
}

module.exports = { transcribeFile };
