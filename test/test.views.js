const tap = require('tap');
const arc = require('@architect/functions');
// stub static function:
arc.http.helpers.static = (myAsset) => myAsset;

process.env.VIEWS_PATH = `${__dirname}/views`;
process.env.SHARED_PATH = __dirname;
const arcJucks = require('../');

tap.test('renders views', async t => {
  const r = await arcJucks.render('hithere.njk', { name: 'robert' });
  t.match(r, 'hi there robert');
  t.end();
});

tap.test('registers and uses helpers', async t => {
  const r = await arcJucks.render('shorten.njk', { name: 'robert' });
  t.match(r, 'hi there rob');
  t.end();
});

tap.test('provides static assets', async t => {
  const r = await arcJucks.render('assets.njk', { });
  t.match(r, 'load this css: /_dist/somewhere/on/s3/main.css');
  t.end();
});
