const { transcribeFile } = require('./transcription');
const { createNote } = require('./notion');
const {
  findNewAudioFiles,
  markFileAsProcessing,
  markFileAsProcessed,
  revertProcessingFile,
  downloadFile,
} = require('./dropbox');

async function processVoiceNotes() {
  const newFiles = await findNewAudioFiles();

  if (newFiles.length === 0) {
    console.log('No new audio files found');
    return;
  }

  console.log(`Found ${newFiles.length} new audio file(s)`);

  for (const file of newFiles) {
    await processFile(file);
  }
}

async function processFile(file) {
  let processingPath;

  try {
    console.log(`Start processing: ${file.name}`);
    processingPath = await markFileAsProcessing(file.path);

    console.log('Downloading file...');
    const fileBuffer = await downloadFile(processingPath);

    console.log('Transcribing...');
    const transcription = await transcribeFile(fileBuffer);

    if (transcription.length) {
      console.log('Creating note...');
      await createNote(transcription);
    } else {
      console.log('Transcription is empty, skipping note creation');
    }

    console.log(`Finish processing: ${file.name}`);
    await markFileAsProcessed(processingPath);
  } catch (error) {
    console.error(`Error processing: ${file.name}`, error);
    if (processingPath) {
      await revertProcessingFile(processingPath);
    }
    throw error;
  }
}

module.exports = {
  processVoiceNotes
}