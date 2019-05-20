## Nunjucks + Pagedata for Arcitect

This library assists in loading nunjucks views, pagedata, and config data.

### Requirements

 - A `config.json` in the root of the `shared` folder.
 - A `views` directory which contain the nunjuck files that will be loaded.
 - A `pages` directory inside of the `views` directory. This is where page templates exist.
 - Optionally place base templates in the `views` directory root that you will `{% extends "base.njk" %}`
 - A clientkit generated `assets.json` from which urls for css/js will be generated.
 - A pagedata configuration section in your `config.json`

### Installation

Run `npm install @firstandthird/arc-nunjucks` in your http route directory.

### Usage

Example http route:

```javascript
const render = require('@firstandthird/arc-nunjucks');

exports.handler = async function http(req) {
  if (req.path !== '/') {
    return {
      statusCode: '404',
      headers: { 'content-type': 'text/html; charset=utf8' },
      body: await render('not-found/view', 'not-found', req)
    }
  }

  return {
    headers: { 'content-type': 'text/html; charset=utf8' },
    body: await render('home/view', 'homepage', req)
  };
}
```

#### Hash

`render(<view>, <pagedata>, request)`

 - `view`     - A of the template that is to be required. Do not add an extention. `.njk` will be automatically added.
 - `pagedata` - The name of the pagedata slug the page will use. Optionally set to false to not load data for this view. (Common will still be loaded if configured)
 - `request`  - Pass the request object to enable cache clearing and access to the request variables in the template.

### Configuration

  - `pagedata`   - <Object> Required
    - `userAgent` - User agent to use in pagedata requests
    - `host`      - Pagedata host
    - `key`       - Pagedata key
    - `status`    - Status to use, `draft` or `published`
  - `context`    - <Object> Additional data to be added to the view
  - `commonSlug` - Pagedata slug for common content. Set to `false` to disable. Will available in the template as `{{common}}`

### Variables available in views

  - `static`   - <Function> Arc's static file helper function. Use when referencing non-clientkit generated files located in `public`. Example: `{{ static('pdf/example.pdf') }}`
  - `asset`    - <Function> Loads a clientkit asset by name. Example: `{{ asset('common.css') }}`
  - `request`  - <Object> Original request object from Arc. Use `request.query` to access query params. Note: These are not passed on 404 routes - bug with arc.

Any other items set in the `context` configuration key will be merged into the view object.

### Clearing cache

Pages are cached the first time rendered and pulled from memory from there. To rebuild cache for a route, visit the url and append `?update=1`

Note: Cache may also be cleared if the function is unloaded from lambda.
