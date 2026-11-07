import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const MAX_FRAMES = 150;
const CONCURRENCY_LIMIT = 8;

const SEQUENCES = [
  {
    id: 1,
    name: 'Sequence 1',
    srcDirs: [
      path.join(ROOT_DIR, '1 animation black'),
      path.join(ROOT_DIR, 'assets', '1st-animation'),
    ],
    outDirLg: path.join(ROOT_DIR, 'public', 'seq', '1', 'lg'),
    outDirSm: path.join(ROOT_DIR, 'public', 'seq', '1', 'sm'),
    manifestPath: path.join(ROOT_DIR, 'public', 'seq', '1', 'manifest.json'),
  },
  {
    id: 2,
    name: 'Sequence 2',
    srcDirs: [
      path.join(ROOT_DIR, '2 animation new'),   // replaced: was "2 animation black"
      path.join(ROOT_DIR, 'assets', '2nd-animation'),
    ],
    outDirLg: path.join(ROOT_DIR, 'public', 'seq', '2', 'lg'),
    outDirSm: path.join(ROOT_DIR, 'public', 'seq', '2', 'sm'),
    manifestPath: path.join(ROOT_DIR, 'public', 'seq', '2', 'manifest.json'),
  },
];

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
    name: 'creators we have worked with',
    srcDir: path.join(ROOT_DIR, 'creators we have worked with'),
    destDir: path.join(ROOT_DIR, 'public', 'creators'),
  },
];

/**
 * Natural sort filenames (e.g. ezgif-frame-001.jpg, ezgif-frame-002.jpg).
 */
function naturalSort(files) {
  return [...files].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
  );
}

/**
 * Filter down to at most maxFrames evenly spaced frames.
 */
function selectFrames(files, maxFrames = MAX_FRAMES) {
  const count = files.length;
  if (count <= maxFrames) {
    return files;
  }
  const step = count / maxFrames;
  const selected = [];
  for (let i = 0; i < maxFrames; i++) {
    const idx = Math.min(count - 1, Math.round(i * step));
    selected.push(files[idx]);
  }
  return selected;
}

/**
 * Run tasks with a concurrency pool.
 */
async function runWithConcurrency(items, concurrencyLimit, taskFn, onProgress) {
  let completed = 0;
  let nextIndex = 0;

  const workers = Array.from({ length: Math.min(concurrencyLimit, items.length) }, async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex++;
      const item = items[currentIndex];
      await taskFn(item, currentIndex);
      completed++;
      if (onProgress) {
        onProgress(completed, items.length);
      }
    }
  });

  await Promise.all(workers);
}

/**
 * Process a single image into lg (1600px, q68) and sm (1280px, q65) WebP formats.
 */
async function processFrame(inputPath, outDirLg, outDirSm, frameNumStr) {
  const outputPathLg = path.join(outDirLg, frameNumStr);
  const outputPathSm = path.join(outDirSm, frameNumStr);

  await Promise.all([
    sharp(inputPath)
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 68 })
      .toFile(outputPathLg),
    sharp(inputPath)
      .resize({ width: 1280, withoutEnlargement: true })
      .webp({ quality: 65 })
      .toFile(outputPathSm),
  ]);
}

/**
 * Process an entire animation sequence.
 */
async function processSequence(seq) {
  console.log(`\n--- Starting ${seq.name} ---`);

  let srcDir = null;
  for (const dir of seq.srcDirs) {
    try {
      await fs.access(dir);
      srcDir = dir;
      break;
    } catch { /* try next */ }
  }

  if (!srcDir) {
    console.warn(`⚠ No source directory found for ${seq.name}. Tried: ${seq.srcDirs.join(', ')}`);
    await fs.mkdir(path.dirname(seq.manifestPath), { recursive: true });
    await fs.writeFile(seq.manifestPath, JSON.stringify({ frameCount: 0 }, null, 2), 'utf-8');
    return;
  }

  console.log(`Source directory: ${srcDir}`);

  // Create output directories
  await fs.mkdir(seq.outDirLg, { recursive: true });
  await fs.mkdir(seq.outDirSm, { recursive: true });

  let entries;
  try {
    entries = await fs.readdir(srcDir);
  } catch (err) {
    throw new Error(`Failed to read source directory "${srcDir}": ${err.message}`);
  }

  const imageFiles = naturalSort(
    entries.filter(file => /\.(jpe?g|png|webp|avif)$/i.test(file))
  );

  if (imageFiles.length === 0) {
    console.warn(`Warning: No image files found in ${srcDir}`);
    await fs.writeFile(seq.manifestPath, JSON.stringify({ frameCount: 0 }, null, 2), 'utf-8');
    return;
  }

  console.log(`Found ${imageFiles.length} raw frames in ${seq.name}`);
  const selectedFiles = selectFrames(imageFiles, MAX_FRAMES);
  const totalFrames = selectedFiles.length;
  console.log(`Selected ${totalFrames} frames for WebP conversion`);

  let lastLoggedPct = -1;
  const onProgress = (completed, total) => {
    // Log at every ~25 frames or at completion
    if (completed === total || completed % 25 === 0) {
      console.log(`Sequence ${seq.id}: ${completed}/${total} frames processed...`);
    }
  };

  const tasks = selectedFiles.map((filename, index) => {
    const frameNum = (index + 1).toString().padStart(4, '0') + '.webp';
    const inputPath = path.join(srcDir, filename);
    return { inputPath, frameNum };
  });

  await runWithConcurrency(
    tasks,
    CONCURRENCY_LIMIT,
    async ({ inputPath, frameNum }) => {
      await processFrame(inputPath, seq.outDirLg, seq.outDirSm, frameNum);
    },
    onProgress
  );

  // Write manifest.json: { "frameCount": N }
  const manifestData = { frameCount: totalFrames };
  await fs.writeFile(seq.manifestPath, JSON.stringify(manifestData, null, 2) + '\n', 'utf-8');
  console.log(`Manifest written: ${seq.manifestPath} -> frameCount: ${totalFrames}`);
}

/**
 * Copy static assets (videos, logos, info) to public directories.
 */
async function copyStaticAssets() {
  console.log('\n--- Copying static assets to public/ ---');
  for (const asset of ASSET_COPIES) {
    try {
      await fs.mkdir(asset.destDir, { recursive: true });
      let entries;
      try {
        entries = await fs.readdir(asset.srcDir, { withFileTypes: true });
      } catch {
        console.warn(`⚠ Asset source directory "${asset.srcDir}" not found, skipping.`);
        continue;
      }
      let copied = 0;
      for (const entry of entries) {
        if (entry.isFile()) {
          const srcPath = path.join(asset.srcDir, entry.name);
          const destPath = path.join(asset.destDir, entry.name);
          await fs.copyFile(srcPath, destPath);
          copied++;
        }
      }
      console.log(`Copied ${copied} file(s) from "${asset.name}" -> "${path.relative(ROOT_DIR, asset.destDir)}"`);
    } catch (err) {
      console.error(`Error copying "${asset.name}":`, err.message);
      throw err;
    }
  }
}

/**
 * Main entry point.
 */
async function main() {
  const isCopyOnly = process.argv.includes('--copy-only') || process.argv.includes('--assets-only');

  try {
    if (isCopyOnly) {
      console.log('Running asset copy only...');
      await copyStaticAssets();
      console.log('\nAsset copy completed successfully.');
      return;
    }

    const startTime = Date.now();
    console.log('Starting frame optimization and asset copying...');

    // Process all sequences
    for (const seq of SEQUENCES) {
      await processSequence(seq);
    }

    // Copy other assets at the end
    await copyStaticAssets();

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\nAll tasks completed successfully in ${elapsed}s!`);
  } catch (err) {
    console.error('\nFatal error during optimization:', err);
    process.exit(1);
  }
}

main();
