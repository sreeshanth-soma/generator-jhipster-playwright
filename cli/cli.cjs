#!/usr/bin/env node

const path = require('path');

const { bin, version } = require('../package.json');

// Get package name to use as namespace.
// Allows blueprints to be aliased.
const packagePath = path.dirname(__dirname);
const packageFolderName = path.basename(packagePath);
const devBlueprintPath = path.join(packagePath, '.blueprint');
const blueprint = packageFolderName.startsWith('jhipster-') ? `generator-${packageFolderName}` : packageFolderName;

(async () => {
  const { runJHipster, done, logger } = await import('generator-jhipster/cli');
  const executableName = Object.keys(bin)[0];

  runJHipster({
    executableName,
    executableVersion: version,
    defaultCommand: 'app',
    devBlueprintPath,
    blueprints: {
      [blueprint]: version,
    },
    printBlueprintLogo: () => {
      console.log('===================== JHipster Playwright =====================');
      console.log('');
    },
    lookups: [{ packagePaths: [packagePath] }],
  }).catch(done);

  process.on('unhandledRejection', up => {
    logger.error('Unhandled promise rejection at:');
    logger.fatal(up);
  });
})();
