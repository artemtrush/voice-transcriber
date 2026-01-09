async function transcribeFile(fileData) {
  console.log(`File received: ${fileData.filename}`);
  console.log(`File size: ${fileData.size} bytes`);

  return 'Transcription text here';
}

module.exports = { transcribeFile };
