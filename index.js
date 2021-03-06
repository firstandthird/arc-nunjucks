const path = require('path');
const fs = require('fs');
const nunjucks = require('nunjucks');
const arc = require('@architect/functions');
const arcStaticAsset = arc.static;

// arc-rapptor also uses the SHARED_PATH env variable:
const assetPath = process.env.SHARED_PATH ? `${process.env.SHARED_PATH}/assets.json` : '@architect/shared/assets.json';
let mapping = false;

if (assetPath.startsWith('@architect') || fs.existsSync(assetPath)) {
  try {
    mapping = require(assetPath);
  } catch (e) {
    // do nothing
  }
}

const routeDir = path.resolve(__dirname, '../../../');
const viewDir = process.env.VIEWS_PATH || path.resolve(routeDir, 'node_modules/@architect/views');
const nEnv = nunjucks.configure([routeDir, viewDir], { autoescape: true });

if (fs.existsSync(`${viewDir}/helpers`)) {
  fs.readdirSync(`${viewDir}/helpers`).forEach(helperFile => {
    const func = require(`${viewDir}/helpers/${helperFile}`);
    const name = path.basename(helperFile, '.js');
    nEnv.addFilter(name, func);
  });
}

const staticAsset = function(file) {
  let config;

  // Arc's static helper can throw errors if file not found
  let url = `/_static/${file}`;

  try {
    url = arcStaticAsset(file);
  } catch (e) {
    console.log(`Error loading static asset: ${file}`);
    console.log(e);
  }

  try {
    config = nEnv.getGlobal('config');
  } catch (e) {
    // silently fail
    // nunjucks errors if global not found
  }

  // Handles cdn being disabled and local relative paths
  if (!config || !config.cdn || !url.startsWith('http')) {
    return url;
  }

  // resets just the domain
  url = new URL(url);
  url.host = config.cdn;

  return url.href;
};

const asset = function (file) {
  let url = '';

  if (mapping && mapping[file]) {
    url = staticAsset(`_dist/${mapping[file]}`);
  } else {
    url = staticAsset(file);
  }

  return url;
};
nEnv.addGlobal('asset', asset);
nEnv.addGlobal('staticAsset', staticAsset);

module.exports = {
  env: nEnv,
  nunjucks,
  render: nunjucks.render,
  staticAsset
};
