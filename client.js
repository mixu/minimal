var https = require('https'),
    http = require('http'),
    qs = require('querystring'),
    url = require('url');

function Client(opts) {
  this.opts = opts || {};
  this.opts.headers || (this.opts.headers = {});
};

Client.prototype.header = function(key, value) {
  this.opts.headers[key] = value;
  return this;
};

Client.prototype.data = function(data) {
  if(!data || Object.keys(data).length == 0) return this;
  if(this.opts.method == 'GET') {
    this.opts.path += '?'+qs.stringify(data);
  } else {
    this.opts.headers['Content-Type'] = 'application/json';
    this.opts.data = JSON.stringify(data);
    this.opts.headers['Content-Length'] = this.opts.data.length;
  }
  return this;
};

Client.prototype.end = function(callback) {
  var proxy = (this.opts.protocol == 'https:' ? https : http).request(this.opts, function(response) {
    callback && callback(undefined, response);
  }).on('error', function(err) { callback && callback(err); });

  if (this.opts.data && this.opts.method != 'GET') {
    proxy.write(this.opts.data);
  }
  proxy.end();
};

// return a function that parses the data
Client.parse = function(callback) {
  var res_data = '';
  return function(err, response) {
    response.on('data', function(chunk) { res_data += chunk });
    response.on('end', function() {
      var type = response.headers['content-type'];
      if(type && type.toLowerCase().indexOf('application/json') > -1) {
        try {
          res_data = JSON.parse(res_data);
        } catch(err) {
          return callback(err, res_data);
        }
      }
      callback && callback(undefined, res_data);
    });
  };
};

['get', 'post', 'put', 'delete'].forEach(function(method) {
  module.exports[method] = function(urlStr) {
    var u = url.parse(urlStr);
    return new Client({
      method: method.toUpperCase(), path: u.path,
      port: u.port, hostname: u.hostname,
      protocol: u.protocol
    });
  };
});
