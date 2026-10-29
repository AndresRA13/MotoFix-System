
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const source = path.join(__dirname, 'dist', 'index.html');
const destination = path.join(__dirname, 'dist', '404.html');

try {
  fs.copyFileSync(source, destination);
  console.log('Success: Copied dist/index.html to dist/404.html');
} catch (error) {
  console.error('Error copying file:', error);
  process.exit(1);
}
