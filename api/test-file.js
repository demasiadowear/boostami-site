// api/test-file.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function handler(req, res) {
  try {
    const files = await fs.readdir(__dirname);
    const promptExists = files.includes('prompt.txt');
    res.status(200).json({ 
      cwd: process.cwd(),
      dirname: __dirname,
      files,
      promptExists 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}