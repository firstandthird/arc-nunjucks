# Nunjucks + Pagedata for Arcitect

This library assists in loading nunjucks views, helpers and static assets.

## Installation

Run `npm install @firstandthird/arc-nunjucks` in your http route directory.

### Render

Example http route:

```javascript
process.env.VIEWS_PATH = '/main/views';
process.env.SHARED_PATH = '/main/shared';

const arcJucks = require('@firstandthird/arc-nunjucks');

exports.handler = async function http(req) {
  if (req.path !== '/') {
    return {
      statusCode: '404',
      headers: { 'content-type': 'text/html; charset=utf8' },
      // will try to render /main/views/not-found.njk with the indicated context:
      body: await arcJucks.render('not-found', { attemptedPath: req.path })
    }
  }

  return {
    headers: { 'content-type': 'text/html; charset=utf8' },
    // will try to render /main/views/homepage.njk with the indicated context:
    body: await arcJucks.render('homepage', { userName: 'karen' })
  };
}
```

### Helpers

Example use of custom filters:

#### /main/views/helpers/shorten.js:

```javascript
// a standard nunjucks filter:
module.exports = function(str, count) {
  return str.slice(0, count || 5);
};```

#### /main/views/shorten.njk:
```nunjucks
hi there <b> {{name|shorten}} </b>
```
#### /src/shared/route.js
```javascript
process.env.VIEWS_PATH = '/main/views';
process.env.SHARED_PATH = '/main/shared';

const arcJucks = require('@firstandthird/arc-nunjucks');

exports.handler = async function http(req) {
  return {
    headers: { 'content-type': 'text/html; charset=utf8' },
    // will try to render /main/views/homepage.njk with the indicated context:
    body: await arcJucks.render('shorten', { userName: 'karenwestington' })
  };
}
```

will render as:
```
  hi there <b> karen </b>
```

## Static Assets:

arc.codes will upload static assets (listed in the ```public/``` directory) and host them on s3 in the respective production/staging server. arc-nunjucks provides a ```static``` filter that will handle mapping the asset name to either the file location (in local mode) or to the appropriate URL on s3 (when in staging or production mode):

```json
{
  "/homepageStyle": "/s3/bucket1/folder1/style.css"
}
```

The asset can now be referred to from within your nunjucks views:

```njk
load this css: {{ asset("/homepageStyle")}}
```

This will always load the correct location for the CSS whether in local, staging or production mode.
