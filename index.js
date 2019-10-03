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
  // Arc's static helper can throw errors if file not found
  let p = `/_static/${file}`;

  try {
    p = arcStaticAsset(file);
  } catch (e) {
    console.log(`Error loading static asset: ${file}`);
    console.log(e);
  }

  return p;
};

const asset = function (file) {
  if (mapping && mapping[file]) {
    return staticAsset(`_dist/${mapping[file]}`);
  }

  return staticAsset(file);
};
nEnv.addGlobal('asset', asset);
nEnv.addGlobal('staticAsset', staticAsset);

module.exports = {
  env: nEnv,
  nunjucks,
  render: nunjucks.render,
  staticAsset
};
