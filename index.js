const nunjucks = require('nunjucks');
const arc = require('@architect/functions');
const static = arc.http.helpers.static;
const mapping = require('@architect/shared/assets.json');
const path = require('path');

const asset = function (file) {
  if (mapping && mapping[file]) {
    return static(`/_dist/${mapping[file]}`);
  }

  return static(file);
};

let renderCache = {};

// page is name of page to render
// context can be an object or function
// forceUpdate refreshes the cache
module.exports = async function layout(page, context = {}, forceUpdate = false) {
  if (forceUpdate) {
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

  // if a method was passed, call it and use the result as the context:
  if (typeof context === 'function') {
    context = await context();
  }

  const fullContext = Object.assign(static, asset, context);

  try {
    const renderedPage = await nunjucks.render(`pages/${page}.njk`, fullContext);
    renderCache[page] = renderedPage;
  } catch (e) {
    console.log(e);
  }

  return renderCache[page];
}
