const sharp = require('sharp');
const path = require('path');

async function makeRound() {
  const inputPath = path.join(__dirname, 'public', 'images', 'cava-logo.jpg');
  const outputPath = path.join(__dirname, 'public', 'images', 'cava-logo-round.png');

  try {
    const metadata = await sharp(inputPath).metadata();
    const size = Math.min(metadata.width, metadata.height);

    const circleSvg = `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" /></svg>`;

    await sharp(inputPath)
      .resize(size, size)
      .composite([{
        input: Buffer.from(circleSvg),
        blend: 'dest-in'
      }])
      .png()
      .toFile(outputPath);

    console.log('Successfully created round logo');
  } catch (err) {
    console.error('Error:', err);
  }
}

makeRound();
