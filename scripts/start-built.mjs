import { access } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const rootDir = process.cwd();
const builtServerPath = path.join(rootDir, 'dist', 'bin', 'www');

const exists = async (targetPath) => {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
};

const start = async () => {
  if (!(await exists(builtServerPath))) {
    console.error('Missing dist build. Run "bun run build" first.');
    process.exit(1);
  }

  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
  }

  await import(pathToFileURL(builtServerPath).href);
};

start().catch((error) => {
  console.error('Failed to start built server:', error);
  process.exit(1);
});
