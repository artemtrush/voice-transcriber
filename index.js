const functions = require('@google-cloud/functions-framework');
const { checkAuthorization } = require('./src/auth');
const { transcribeFile } = require('./src/transcribe-file');
const { createNote } = require('./src/create-note');

functions.http('voiceTranscriber', async (req, res) => {
  if (!checkAuthorization(req.headers)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('Request headers', req.headers);
  console.log('Request body', req.body.toString());

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Start processing file...');
    const fileBuffer = req.body;

    if (!Buffer.isBuffer(fileBuffer)) {
      console.error('Request body is not a Buffer');
      return res.status(400).json({ error: 'Invalid file format - expected binary data' });
    }

    console.log(`File buffer size: ${fileBuffer.length} bytes`);

    console.log('Transcribing file...');
    const transcription = await transcribeFile(fileBuffer);

    console.log('Creating note...');
    await createNote(transcription);

    console.log('Successfully processed file');
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'Failed to process file' });
  }
});
