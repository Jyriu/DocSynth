const pdfParse = require('pdf-parse');

/**
 * Extract plain text from an uploaded file (multer File object).
 * Currently supports:
 *  - application/pdf
 *  - text/plain
 *
 * @param {import('multer').File} file
 * @returns {Promise<string>} raw text
 */
module.exports = async function extractText(file) {
  const { mimetype, buffer } = file;
  if (mimetype === 'application/pdf') {
    const { text } = await pdfParse(buffer);
    return text;
  }
  if (mimetype.startsWith('text/')) {
    return buffer.toString('utf8');
  }
  throw new Error(`Unsupported file type: ${mimetype}`);
};
