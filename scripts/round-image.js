#!/usr/bin/env node
const sharp = require('sharp');
const path = require('path');

const inputPath = process.argv[2];
const outputPath = process.argv[3] || inputPath;
const radiusPercent = parseFloat(process.argv[4]) || 15;

if (!inputPath) {
  console.log('Usage: node round-image.js <input> [output] [radius%]');
  console.log('Example: node round-image.js image.png rounded-image.png 20');
  process.exit(1);
}

sharp(inputPath)
  .metadata()
  .then(metadata => {
    const size = Math.max(metadata.width || 256, metadata.height || 256);
    const radius = Math.floor(size * (radiusPercent / 100));
    
    const svgMask = `<svg width="${size}" height="${size}">
      <rect x="0" y="0" width="${size}" height="${size}" 
            rx="${radius}" ry="${radius}"/>
    </svg>`;
    
    return sharp(inputPath)
      .resize(size, size, { fit: 'cover' })
      .composite([{
        input: Buffer.from(svgMask),
        blend: 'dest-in'
      }])
      .png()
      .toFile(outputPath);
  })
  .then(() => console.log(`Done! Saved to ${outputPath}`))
  .catch(err => console.error('Error:', err));
