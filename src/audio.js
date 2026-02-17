const fs = require('fs/promises');
const path = require('path');
const os = require('os');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegStatic);

function getTempFilePath(prefix, ext) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);

  return path.join(os.tmpdir(), `${prefix}-${timestamp}-${random}${ext}`);
}

function getAudioDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata.format.duration);
    });
  });
}

function extractChunk(inputPath, startSec, durationSec, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .setStartTime(startSec)
      .setDuration(durationSec)
      .output(outputPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });
}

async function splitAudioBuffer(fileBuffer, chunkDurationSec) {
  const inputPath = getTempFilePath('input', '.mp3');
  const filesToCleanUp = [inputPath];

  try {
    await fs.writeFile(inputPath, fileBuffer);

    const totalDuration = await getAudioDuration(inputPath);

    if (totalDuration <= chunkDurationSec) {
      return [fileBuffer];
    }

    const chunks = [];
    let startSec = 0;

    while (startSec < totalDuration) {
      const chunkPath = getTempFilePath('chunk', '.mp3');
      filesToCleanUp.push(chunkPath);

      const remaining = totalDuration - startSec;
      const duration = Math.min(chunkDurationSec, remaining);

      await extractChunk(inputPath, startSec, duration, chunkPath);

      const chunkBuffer = await fs.readFile(chunkPath);
      chunks.push(chunkBuffer);

      startSec += chunkDurationSec;
    }

    return chunks;
  } finally {
    await Promise.allSettled(filesToCleanUp.map(filePath => fs.unlink(filePath)));
  }
}

module.exports = { splitAudioBuffer };
