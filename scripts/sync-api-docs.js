import { copyFile, mkdir, readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const projectRoot = process.cwd();
const configPath = path.join(projectRoot, 'sync-api-docs.json');

async function main() {
  const config = await readConfig(configPath);
  const sourceRoot = path.resolve(projectRoot, config.targetPath);
  const sourceStats = await statSafe(sourceRoot);

  if (!sourceStats) {
    throw new Error(`targetPath does not exist: ${sourceRoot}`);
  }

  if (!sourceStats.isDirectory()) {
    throw new Error(`targetPath must be a directory: ${sourceRoot}`);
  }

  const destinationRoot = path.join(projectRoot, 'api-docs');
  const ignoreRules = normalizeIgnoreRules(config.ignore);
  const summary = {
    copiedFiles: 0,
    createdDirectories: 0,
    skippedEntries: 0,
  };

  await copyDirectory(sourceRoot, destinationRoot, sourceRoot, ignoreRules, summary);

  console.log(`Sync completed: ${sourceRoot} -> ${destinationRoot}`);
  console.log(
    `Copied ${summary.copiedFiles} files, created ${summary.createdDirectories} directories, skipped ${summary.skippedEntries} entries`,
  );
}

async function readConfig(filePath) {
  const raw = await readFile(filePath, 'utf8');
  const config = JSON.parse(raw);

  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('sync-api-docs.json must contain a JSON object');
  }

  if (typeof config.targetPath !== 'string' || !config.targetPath.trim()) {
    throw new Error('sync-api-docs.json targetPath must be a non-empty string');
  }

  if (config.ignore !== undefined && !Array.isArray(config.ignore)) {
    throw new Error('sync-api-docs.json ignore must be an array of strings');
  }

  if (Array.isArray(config.ignore) && config.ignore.some((rule) => typeof rule !== 'string')) {
    throw new Error('sync-api-docs.json ignore can only contain strings');
  }

  return {
    targetPath: config.targetPath.trim(),
    ignore: Array.isArray(config.ignore) ? config.ignore : [],
  };
}

function normalizeIgnoreRules(ignoreRules) {
  return ignoreRules
    .filter((rule) => typeof rule === 'string')
    .map((rule) => normalizeRelativePath(rule))
    .filter(Boolean);
}

function normalizeRelativePath(value) {
  const normalized = value.replace(/\\/g, '/').replace(/^\.\/+/, '').replace(/^\/+|\/+$/g, '');
  return normalized;
}

function shouldIgnore(relativePath, ignoreRules) {
  if (!relativePath) {
    return false;
  }

  const normalizedPath = normalizeRelativePath(relativePath);

  return ignoreRules.some((rule) => normalizedPath === rule || normalizedPath.startsWith(`${rule}/`));
}

async function copyDirectory(sourceDir, destinationDir, sourceRoot, ignoreRules, summary) {
  await ensureDirectory(destinationDir, summary);

  const entries = await readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const destinationPath = path.join(destinationDir, entry.name);
    const relativePath = normalizeRelativePath(path.relative(sourceRoot, sourcePath));

    if (shouldIgnore(relativePath, ignoreRules)) {
      summary.skippedEntries += 1;
      continue;
    }

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, destinationPath, sourceRoot, ignoreRules, summary);
      continue;
    }

    if (entry.isFile()) {
      await copyFile(sourcePath, destinationPath);
      summary.copiedFiles += 1;
      continue;
    }

    summary.skippedEntries += 1;
  }
}

async function ensureDirectory(directoryPath, summary) {
  const existing = await statSafe(directoryPath);

  if (existing) {
    if (!existing.isDirectory()) {
      throw new Error(`Destination path already exists and is not a directory: ${directoryPath}`);
    }

    return;
  }

  await mkdir(directoryPath, { recursive: true });
  summary.createdDirectories += 1;
}

async function statSafe(targetPath) {
  try {
    return await stat(targetPath);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return null;
    }

    throw error;
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Sync failed: ${message}`);
  process.exitCode = 1;
});
