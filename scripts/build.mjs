import { rm, cp, readdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { transform } from 'esbuild';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');

const copyTargets = ['app.js', 'bin', 'routes', 'views', 'public'];

const exists = async (targetPath) => {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
};

const collectFiles = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath)));
    } else {
      files.push(fullPath);
    }
  }

  return files;
};

const minifyAsset = async (filePath) => {
  const extension = path.extname(filePath).toLowerCase();
  if (extension !== '.js' && extension !== '.css') {
    return;
  }

  const loader = extension === '.js' ? 'js' : 'css';
  const source = await readFile(filePath, 'utf8');
  const result = await transform(source, {
    loader,
    minify: true,
    legalComments: 'none'
  });

  await writeFile(filePath, result.code, 'utf8');
};

const build = async () => {
  await rm(distDir, { recursive: true, force: true });

  for (const target of copyTargets) {
    const sourcePath = path.join(rootDir, target);
    if (!(await exists(sourcePath))) {
      continue;
    }

    const destinationPath = path.join(distDir, target);
    await cp(sourcePath, destinationPath, { recursive: true });
  }

  const publicDir = path.join(distDir, 'public');
  if (await exists(publicDir)) {
    const files = await collectFiles(publicDir);
    await Promise.all(files.map(minifyAsset));
  }

  console.log('Build complete -> dist/');
};

build().catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});
