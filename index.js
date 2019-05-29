const nunjucks = require('nunjucks');
const arc = require('@architect/functions');
const static = arc.http.helpers.static;
const mapping = require('@architect/shared/assets.json');
const config = require('@architect/shared/config.json');
const path = require('path');

const asset = function (file) {
  if (mapping && mapping[file]) {
    return static(`/_dist/${mapping[file]}`);
  }

  return static(file);
};

let renderCache = {};

module.exports = async function layout(page, additionalContent = {}, viewContext = {}, request = {}) {
  if (!request.query) {
    request.query = {};
  }

  if (request.query.update) {
    console.log('Clearing cache');
    renderCache = {};
  }

  if (renderCache[page]) {
    console.log(`Using cache for ${page}`);
    return renderCache[page];
  }

  console.log(`Rendering ${page}`);

  const sharedPath = path.dirname(require.resolve('@architect/shared/config.json'));

  nunjucks.configure(`${sharedPath}/views`, { autoescape: true });

  const common = Object.assign({
    static,
    asset,
    request
  }, config.context || {});

  const data = typeof additionalContent === 'function'? await additionalContent(config) : additionalContent;

  const context = Object.assign(viewContext, common, data);

  try {
    const renderedPage = await nunjucks.render(`pages/${page}.njk`, context);
    renderCache[page] = renderedPage;
  } catch (e) {
    console.log(e);
  }

  return renderCache[page];
}
