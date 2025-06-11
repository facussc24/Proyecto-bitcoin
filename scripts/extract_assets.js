import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, '..', 'assets', 'img');

const outputMap = {
  'logo.txt': 'logo.png',
  'hero-bg.txt': 'hero-bg.jpg',
};

if (!fs.existsSync(assetsDir)) {
  console.error('Assets directory not found:', assetsDir);
  process.exit(1);
}

for (const file of fs.readdirSync(assetsDir)) {
  if (file.endsWith('.txt')) {
    const inputPath = path.join(assetsDir, file);
    const outputName = outputMap[file] || file.replace(/\.txt$/, '');
    const outputPath = path.join(assetsDir, outputName);
    if (fs.existsSync(outputPath)) {
      console.log('Skipping existing', outputName);
      continue;
    }
    const base64 = fs.readFileSync(inputPath, 'utf8').trim();
    const buffer = Buffer.from(base64, 'base64');
    fs.writeFileSync(outputPath, buffer);
    console.log('Decoded', outputName);
  }
}
