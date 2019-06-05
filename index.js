const nunjucks = require('nunjucks');
const arc = require('@architect/functions');
const static = arc.http.helpers.static;
const mapping = require('@architect/shared/assets.json');
const path = require('path');
const fs = require('fs');

const routeDir = path.resolve(__dirname, '../../../');
const viewDir = path.resolve(routeDir, 'node_modules/@architect/views');

const nEnv = nunjucks.configure([routeDir, viewDir], { autoescape: true });

if (fs.existsSync(`${viewDir}/helpers`)) {
  fs.readdirSync(`${viewDir}/helpers`).forEach(helperFile => {
    const func = require(`${viewDir}/helpers/${helperFile}`);
    const name = path.basename(helperFile, '.js');
    nEnv.addFilter(name, func);
  });
}

const asset = function (file) {
  if (mapping && mapping[file]) {
    return static(`/_dist/${mapping[file]}`);
  }

  return static(file);
};
nEnv.addGlobal('asset', asset);

module.exports = {
  env: nEnv,
  nunjucks,
  render: nunjucks.render
}
