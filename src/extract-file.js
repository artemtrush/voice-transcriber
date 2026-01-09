const Busboy = require('busboy');

function extractFileFromRequest(req) {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers });

    busboy.on('file', (fieldname, file, info) => {
      resolve({
        stream: file,
        filename: info.filename,
        mimeType: info.mimeType
      });
    });

    busboy.on('error', reject);

    req.pipe(busboy);
  });
}

module.exports = { extractFileFromRequest };
