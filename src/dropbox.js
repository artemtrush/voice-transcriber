const { Dropbox } = require('dropbox');
const crypto = require('crypto');
const config = require('./config');
const { CLEANUP_RETENTION_DAYS } = require('./constants');

const PROCESSING_SUFFIX = '.processing';
const PROCESSED_SUFFIX = '.processed';

let dropboxClient;

function getDropboxClient() {
  if (dropboxClient) {
    return dropboxClient;
  }

  dropboxClient = new Dropbox({
    clientId: config.dropbox.appKey,
    clientSecret: config.dropbox.appSecret,
    refreshToken: config.dropbox.refreshToken,
  });

  return dropboxClient;
}

function isAudioFile(filename) {
  const supportedExtensions = ['mp3'];

  return supportedExtensions.some(ext => filename.toLowerCase().endsWith(`.${ext}`));
}

function isProcessingFile(filename) {
  return filename.endsWith(PROCESSING_SUFFIX);
}

function isProcessedFile(filename) {
  return filename.endsWith(PROCESSED_SUFFIX);
}

async function listAllFiles() {
  const client = getDropboxClient();
  let folderPath = config.dropbox.folderPath;

  if (!folderPath.startsWith('/')) {
    folderPath = '/' + folderPath;
  }

  const response = await client.filesListFolder({ path: folderPath, recursive: true });

  let result = response.result;
  const allEntries = [...result.entries];

  while (result.has_more) {
    const nextResponse = await client.filesListFolderContinue({ cursor: result.cursor });

    result = nextResponse.result;
    allEntries.push(...result.entries);
  }

  return allEntries;
}

async function findNewAudioFiles() {
  const entries = await listAllFiles();

  const audioFiles = entries.filter(entry => {
    if (entry['.tag'] !== 'file') {
      return false;
    }

    if (entry.name === 'recording 2026-01-13 22-53.mp3.processed') {
      return true;
    }

    if (isProcessingFile(entry.name) || isProcessedFile(entry.name)) {
      return false;
    }

    return isAudioFile(entry.name);
  });

  return audioFiles.map(file => ({
    id: file.id,
    name: file.name,
    path: file.path_lower,
    size: file.size,
  }));
}

async function markFileAsProcessing(filePath) {
  const client = getDropboxClient();
  const newPath = filePath + PROCESSING_SUFFIX;

  try {
    await client.filesMoveV2({
      from_path: filePath,
      to_path: newPath,
      autorename: false,
    });

    return newPath;
  } catch (error) {
    console.error(`Error marking file as processing: ${filePath}`, error);
    throw error;
  }
}

async function markFileAsProcessed(filePath) {
  const client = getDropboxClient();
  const basePath = filePath.replace(PROCESSING_SUFFIX, '');
  const newPath = basePath + PROCESSED_SUFFIX;

  try {
    await client.filesMoveV2({
      from_path: filePath,
      to_path: newPath,
      autorename: false,
    });

    return newPath;
  } catch (error) {
    console.error(`Error marking file as processed: ${filePath}`, error);
    throw error;
  }
}

async function revertProcessingFile(filePath) {
  const client = getDropboxClient();
  const originalPath = filePath.replace(PROCESSING_SUFFIX, '');

  try {
    await client.filesMoveV2({
      from_path: filePath,
      to_path: originalPath,
      autorename: false,
    });

    return originalPath;
  } catch (error) {
    console.error(`Error reverting processing file: ${filePath}`, error);
    throw error;
  }
}

async function downloadFile(filePath) {
  const client = getDropboxClient();
  try {
    const response = await client.filesDownload({ path: filePath });

    return response.result.fileBinary;
  } catch (error) {
    console.error(`Error downloading file: ${filePath}`, error);
    throw error;
  }
}

async function findOldProcessedFiles() {
  const entries = await listAllFiles();
  const cutoffDate = new Date();

  cutoffDate.setDate(cutoffDate.getDate() - CLEANUP_RETENTION_DAYS);

  const oldProcessedFiles = entries.filter(entry => {
    if (entry['.tag'] !== 'file') {
      return false;
    }

    if (!isProcessedFile(entry.name)) {
      return false;
    }

    const fileModifiedDate = new Date(entry.client_modified);

    return fileModifiedDate < cutoffDate;
  });

  return oldProcessedFiles.map(file => ({
    id: file.id,
    name: file.name,
    path: file.path_lower,
    modifiedDate: file.client_modified,
  }));
}

async function deleteFile(filePath) {
  const client = getDropboxClient();
  try {
    await client.filesDeleteV2({ path: filePath });
  } catch (error) {
    console.error(`Error deleting file: ${filePath}`, error);
    throw error;
  }
}

function verifyWebhookSignature(signature, body) {
  const expectedSignature = crypto
    .createHmac('sha256', config.dropbox.appSecret)
    .update(body)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

module.exports = {
  findNewAudioFiles,
  markFileAsProcessing,
  markFileAsProcessed,
  revertProcessingFile,
  downloadFile,
  findOldProcessedFiles,
  deleteFile,
  verifyWebhookSignature,
};
