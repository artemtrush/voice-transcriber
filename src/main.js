const { transcribeFile, analyzeTranscription } = require('./openai');
const { createNote } = require('./notion');
const {
  findNewAudioFiles,
  markFileAsProcessing,
  markFileAsProcessed,
  revertProcessingFile,
  downloadFile,
  findOldProcessedFiles,
  deleteFile,
} = require('./dropbox');

async function processVoiceNotes() {
  console.log('Looking for new audio files...');
  const newFiles = await findNewAudioFiles();

  if (newFiles.length === 0) {
    console.log('No new audio files found');
  } else {
    console.log(`Found ${newFiles.length} new audio file(s)`);

    for (const file of newFiles) {
      await processFile(file);
    }
  }

  console.log('Cleaning up old processed files...');
  await cleanupOldFiles();
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

    console.log('Analyzing transcription...');
    const analysis = await analyzeTranscription(transcription);

    if (analysis) {
      console.log('Creating note...');
      await createNote(analysis);
    } else {
      console.log('Analysis does not make sense, skipping note creation');
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

async function cleanupOldFiles() {
  try {
    const oldFiles = await findOldProcessedFiles();

    if (oldFiles.length === 0) {
      console.log('No old processed files to clean up');
      return;
    }

    for (const file of oldFiles) {
      await deleteFile(file.path);
    }

    console.log(`Cleaned up ${oldFiles.length} old processed file(s)`);
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

module.exports = {
  processVoiceNotes
}