# Minimal

Minimal implementations of common functionality, with sane APIs.

## Client

Usage example:

    var client = require('client');

    // GET
    client
      .get('http://localhost/foo')
      .data({ abc: 'def' }) // encoded into query string
      .end(function(err, data) {
        console.log(data);
      });

    // POST
    client
      .post('http://localhost/foo')
      .data({ abc: 'def' }) // encoded as JSON
      .end(function(err, data) {
        console.log(data);
      });

    // pipe to file
    var ws = fs.createWriteStream('./google.txt');
    client
      .get('http://google.com')
      .pipe(ws, function(err) {
        if(err) throw err;
      });


## Router

Usage example:

    var fs = require('fs'),
        http = require('http'),
        Router = require('router');

    var app = new Router();

    // basic GET route
    app.get(new RegExp('^/users/(.+)$'), function(req, res, match) {
      // match: result from running RegExp.exec() on the currently matching route
      // e.g: /users/123  [ '/users/123', '123' ]
      var id = match[1];
      console.log(id);
    });

    // serving a static file
    app.get(new RegExp('^/static/(.+)$'), function(req, res, match) {
      fs.createReadStream('./static/'+match[1]).pipe(res);
    });

    // parsing POST params
    app.post(new RegExp('^/users/(.+)$'), app.parse(function(req, res, match, data) {
      console.log(data);
    }));

    // piping a PUT to a file
    app.put(new RegExp('^/file/(.+)$'), function(req, res) {
        req.pipe(fs.createWriteStream('./static/'+match[1]));
      });

    // invoking Router.route(req, res):

    var server = http.createServer();

    server.on('request', function(req, res) {
      // returns false if no route matched, allowing you to chain apis
      if(!api.route(req, res)) {
        console.log('No route found', req.url);
        res.end();
      }
    }).listen(8080, 'localhost');

