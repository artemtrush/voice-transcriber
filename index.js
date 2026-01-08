const functions = require('@google-cloud/functions-framework');

functions.http('voiceTranscriber', async (req, res) => {
  if (!checkAuthorization(req.headers)) {
    console.warn('Unauthorized access attempt');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('Starting transcription...');

  await new Promise(resolve => setTimeout(resolve, 5000));

  res.status(200).json({ success: true });
});

function checkAuthorization(headers) {
  const authHeader = headers.authorization;
  const expectedToken = process.env.AUTH_TOKEN;

  if (!expectedToken || !authHeader) {
    return false;
  }

  return authHeader === expectedToken;
}
