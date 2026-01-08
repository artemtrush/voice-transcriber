const functions = require('@google-cloud/functions-framework');

functions.http('voiceTranscriber', async (req, res) => {
  console.log('Starting transcription...');

  await new Promise(resolve => setTimeout(resolve, 5000));

  const response = {
    status: 'success',
  };

  res.status(200).json(response);
});
