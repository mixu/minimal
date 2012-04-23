var url = require('url');

function Router() {
  this.routes = [];
};

Router.prototype.route = function(req, res) {
  var pathname = url.parse(req.url).pathname;

  return this.routes.some(function(route) {
    var isMatch = (route.method == req.method && route.expression.test(pathname));
    if (isMatch) {
      route.callback(req, res, route.expression.exec(pathname));
    }
    return isMatch;
  });
};

// return a function that handles the parsing
Router.prototype.parse = function(callback) {
  return function(req, res, match) {
    var data = '';
    req.on('data', function(chunk) { data += chunk; }).on('end', function() {
      callback(req, res, match, data);
    });
  };
};

['get', 'post', 'put', 'delete'].forEach(function(method) {
  Router.prototype[method] = function(regexp, callback) {
    this.routes.push({ method: method.toUpperCase(), expression: regexp, callback: callback });
  };
});

module.exports = Router;
