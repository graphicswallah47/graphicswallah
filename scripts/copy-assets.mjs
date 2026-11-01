import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const ASSET_COPIES = [
  {
    name: 'background videos',
    srcDir: path.join(ROOT_DIR, 'background videos'),
    destDir: path.join(ROOT_DIR, 'public', 'videos'),
  },
  {
    name: 'company logo',
    srcDir: path.join(ROOT_DIR, 'company logo'),
    destDir: path.join(ROOT_DIR, 'public', 'logos'),
  },
  {
    name: 'graphics wallah info',
    srcDir: path.join(ROOT_DIR, 'graphics wallah info'),
    destDir: path.join(ROOT_DIR, 'public', 'info'),
  },
  {
    name: 'background video',
    srcDir: path.join(ROOT_DIR, 'background video'),
    destDir: path.join(ROOT_DIR, 'public', 'services'),
  },
];

async function copyAssets() {
  console.log('Copying static assets to public/...');
  for (const asset of ASSET_COPIES) {
    try {
      await fs.mkdir(asset.destDir, { recursive: true });
      const entries = await fs.readdir(asset.srcDir, { withFileTypes: true });
      let count = 0;
      for (const entry of entries) {
        if (entry.isFile()) {
          const srcPath = path.join(asset.srcDir, entry.name);
          const destPath = path.join(asset.destDir, entry.name);
          await fs.copyFile(srcPath, destPath);
          count++;
        }
      }
      console.log(`Copied ${count} file(s) from "${asset.name}" to "${path.relative(ROOT_DIR, asset.destDir)}"`);
    } catch (err) {
      console.error(`Error copying assets from "${asset.name}":`, err.message);
    }
  }
  console.log('Static asset copy complete.');
}

copyAssets().catch(err => {
  console.error('Failed to copy assets:', err);
  process.exit(1);
});
