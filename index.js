const functions = require('@google-cloud/functions-framework');
const { checkAuthorization } = require('./src/auth');
const { extractFileFromRequest } = require('./src/extract-file');
const { transcribeFile } = require('./src/transcribe-file');
const { createNote } = require('./src/create-note');

functions.http('voiceTranscriber', async (req, res) => {
  if (!checkAuthorization(req.headers)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('Request received', req.headers);
  console.log('Request method', req.body);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Start processing file...');

    console.log('Extracting file from request...');
    const fileData = await extractFileFromRequest(req);

    console.log('Transcribing file...');
    const transcription = await transcribeFile(fileData);

    console.log('Creating note...');
    await createNote(transcription);

    console.log('Successfully processed file');
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'Failed to process file' });
  }
});
