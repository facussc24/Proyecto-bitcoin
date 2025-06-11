const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');

if (!fs.existsSync(assetsDir)) {
  console.error('Assets directory not found:', assetsDir);
  process.exit(1);
}

for (const file of fs.readdirSync(assetsDir)) {
  if (file.endsWith('.txt')) {
    const inputPath = path.join(assetsDir, file);
    const outputName = file.replace(/\.txt$/, '');
    const outputPath = path.join(assetsDir, outputName);
    const base64 = fs.readFileSync(inputPath, 'utf8').trim();
    const buffer = Buffer.from(base64, 'base64');
    fs.writeFileSync(outputPath, buffer);
    console.log('Decoded', outputName);
  }
}
