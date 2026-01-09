const functions = require('@google-cloud/functions-framework');
const { checkAuthorization } = require('./src/auth');
const { extractFileFromRequest } = require('./src/extract-file');
const { transcribeFile } = require('./src/transcribe-file');
const { createNote } = require('./src/create-note');

functions.http('voiceTranscriber', async (req, res) => {
  if (!checkAuthorization(req.headers)) {
    console.warn('Unauthorized access attempt');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Start processing ...');

    const fileData = await extractFileFromRequest(req);
    const transcription = await transcribeFile(fileData);

    await createNote(transcription);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'Failed to process file' });
  }
});
