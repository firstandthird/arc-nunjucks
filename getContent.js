const pagedata = require('pagedata');
const config = require('@architect/shared/config.json');

const api = new pagedata(config.pagedata);

module.exports = function (slug) {
  console.log(`Fetching ${slug} from pagedata`);
  return api.getPage(`sgff-${slug}`);
}
