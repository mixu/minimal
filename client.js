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
  var res_data = '';

  this.opts.protocol.request(this.opts, function(response) {
    response.on('data', function(chunk) { res_data += chunk; });
    response.on('end', function() {
      callback && callback(undefined, res_data);
    });
  }).on('error', function(err) { callback && callback(err); });
};

Client.prototype.pipe = function(writeStream, callback) {
  this.opts.protocol.request(this.opts, function(response) {
    response.pipe(writeStream);
    callback && callback(undefined);
  }).on('error', function(err) { callback && callback(err); });
};

['get', 'post', 'put', 'delete'].forEach(function(method) {
  module.exports[method] = function(urlStr) {
    var u = url.parse(urlStr);
    return new Client({
      method: method.toUpperCase(), path: u.path,
      port: u.port, hostname: u.hostname,
      protocol: (u.protocol == 'https:' ? https : http)
    });
  };
});
