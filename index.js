const functions = require('@google-cloud/functions-framework');
const { verifyWebhookSignature } = require('./src/dropbox');
const { processVoiceNotes } = require('./src/main');

functions.http('voiceTranscriber', async (req, res) => {
  if (req.method === 'GET' && req.query.challenge) {
    console.log('Dropbox webhook verification received');
    return res.status(200).send(req.query.challenge);
  }

  const signature = req.headers['x-dropbox-signature'];

  if (!signature) {
    console.error('Missing webhook signature header');
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (!verifyWebhookSignature(signature, req.rawBody)) {
    console.error('Invalid webhook signature');
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    await processVoiceNotes()
    return res.status(200).send('OK');
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
