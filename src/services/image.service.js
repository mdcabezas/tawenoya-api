const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

const THUMB_OPTIONS = {
  width: 800,
  height: 800,
  fit: 'inside',
  withoutEnlargement: true,
};

const ORIGINAL_OPTIONS = {
  width: 2048,
  height: 2048,
  fit: 'inside',
  withoutEnlargement: true,
};

async function processImage(fileBuffer) {
  const reportId = uuidv4();

  const thumb = await sharp(fileBuffer)
    .autoOrient()
    .resize(THUMB_OPTIONS)
    .webp({ quality: 80 })
    .toBuffer();

  const original = await sharp(fileBuffer)
    .autoOrient()
    .resize(ORIGINAL_OPTIONS)
    .webp({ quality: 90 })
    .toBuffer();

  return {
    reportId,
    thumb,
    original,
  };
}

module.exports = { processImage };
