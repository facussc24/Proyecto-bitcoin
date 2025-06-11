import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imgDir = path.join(__dirname, '..', 'assets', 'img');

if (!fs.existsSync(imgDir)) {
  console.error('Assets directory not found:', imgDir);
  process.exit(1);
}

const mapping = {
  'hero-bg.txt': 'hero-bg.jpg',
  'logo.txt': 'logo.png'
};

for (const file of fs.readdirSync(imgDir)) {
  if (file.endsWith('.txt')) {
    const inputPath = path.join(imgDir, file);
    const outputName = mapping[file] || file.replace(/\.txt$/, '');
    const outputPath = path.join(imgDir, outputName);
    const base64 = fs.readFileSync(inputPath, 'utf8').trim();
    const buffer = Buffer.from(base64, 'base64');
    fs.writeFileSync(outputPath, buffer);
    console.log('Decoded', outputName);
  }
}
