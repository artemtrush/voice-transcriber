const { experimental_transcribe: transcribe, generateObject } = require('ai');
const { openai } = require('@ai-sdk/openai');
const config = require('./config');
const { TRANSCRIPTION_WORDS_THRESHOLD, TRANSCRIPTION_AUDIO_CHUNK_DURATION } = require('./constants');
const { splitAudioBuffer } = require('./audio');
const { ANALYSIS_PROMPT, ANALYSIS_SCHEMA } = require('./prompts');

async function transcribeFile(fileBuffer) {
  const chunks = await splitAudioBuffer(fileBuffer, TRANSCRIPTION_AUDIO_CHUNK_DURATION);
  const texts = [];

  for (const chunk of chunks) {
    const transcript = await transcribe({
      model: openai.transcription('gpt-4o-transcribe', {
        apiKey: config.openai.apiKey,
      }),
      audio: chunk,
    });

    texts.push(transcript.text);
  }

  return texts.join(' ');
}

function countWords(text) {
  return text.trim().split(/\s+/).length;
}

async function analyzeTranscription(transcriptionText) {
  if (countWords(transcriptionText) <= TRANSCRIPTION_WORDS_THRESHOLD) {
    return null;
  }

  const { object } = await generateObject({
    model: openai.chat('gpt-4.1', {
      apiKey: config.openai.apiKey,
    }),
    temperature: 0.5,
    schema: ANALYSIS_SCHEMA,
    messages: [
      {
        role: 'system',
        content: ANALYSIS_PROMPT,
      },
      {
        role: 'user',
        content: transcriptionText,
      },
    ],
  });

  return {
    title: object.title,
    text: transcriptionText,
  };
}

module.exports = { transcribeFile, analyzeTranscription };
