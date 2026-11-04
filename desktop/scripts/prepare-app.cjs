const fs = require('node:fs');
const path = require('node:path');
const source = path.resolve(__dirname, '..', '..', 'ad-template-studio', 'dist');
const destination = path.resolve(__dirname, '..', 'app');
if (!fs.existsSync(source)) throw new Error(`Editor source not found: ${source}`);
fs.rmSync(destination, { recursive: true, force: true });
fs.cpSync(source, destination, { recursive: true });
console.log(`Copied editor assets to ${destination}`);
