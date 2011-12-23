(function() {
  var Pingdom, createClient, http, request, url;

  http = require('http');

  url = require('url');

  request = require('request');

  Pingdom = (function() {
    Pingdom.name = 'Pingdom';
    function Pingdom(apiKey, username, password, version) {
      this.apiKey = apiKey;
      this.username = username;
      this.password = password;
      this.version = version != null ? version : '2.0';
      if (!(this instanceof Pingdom)) {
        return new Pingdom(apiKey, username, password, version);
      }
      this.checks = [];
      this.baseUrl = "https://api.pingdom.com/api/" + this.version;
    }

    Pingdom.prototype.getCurrentServerTime = function(dataCallback) {
      var requestUrl;
      requestUrl = "" + this.baseUrl + "/servertime";
      return this.apiCall(requestUrl, dataCallback);
    };

    Pingdom.prototype.getCheckList = function(force, dataCallback) {
      var requestUrl;
      if (arguments.length === 1) {
        dataCallback = force;
        force = false;
      }
      if (!(force || this.checks.length === 0)) return this.checks;
      requestUrl = "" + this.baseUrl + "/checks";
      return this.apiCall(requestUrl, function(checks) {
        this.checks = checks;
        if (dataCallback) return dataCallback(checks);
      });
    };

    Pingdom.prototype.getDetailedCheckInfo = function(checkId, dataCallback) {
      var requestUrl;
      requestUrl = "" + this.baseUrl + "/checks/" + checkId;
      return this.apiCall(requestUrl, dataCallback);
    };

    Pingdom.prototype.getSummaryAverage = function(checkId, options, dataCallback) {
      var requestUrl;
      requestUrl = "" + this.baseUrl + "/summary.average/" + checkId + "/?" + (Pingdom.toQueryString(options));
      return this.apiCall(requestUrl, dataCallback);
    };

    Pingdom.prototype.getSummaryHoursOfDay = function(checkId, options, dataCallback) {
      var requestUrl;
      if (options == null) options = {};
      requestUrl = "" + this.baseUrl + "/summary.hoursofday/" + checkId + "/?" + (Pingdom.toQueryString(options));
      return this.apiCall(requestUrl, dataCallback);
    };

    Pingdom.prototype.apiCall = function(requestUrl, dataCallback) {
      var options, req;
      if (!this.auth) {
        this.auth = 'Basic ' + new Buffer(this.username + ':' + this.password).toString('base64');
      }
      options = {
        uri: url.parse(requestUrl),
        headers: {
          'App-Key': this.apiKey,
          'Authorization': this.auth
        }
      };
      return req = request(options, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          return dataCallback(JSON.parse(body));
        } else {
          return console.log("Error: " + error + "\nResponse: " + response.body);
        }
      });
    };

    Pingdom.toQueryString = function(options) {
      var key, pairs, value;
      pairs = (function() {
        var _results;
        _results = [];
        for (key in options) {
          value = options[key];
          _results.push("" + key + "=" + value);
        }
        return _results;
      })();
      return pairs.join('&');
    };

    return Pingdom;

  })();

  createClient = function(apiKey, username, password, version) {
    return new Pingdom(apiKey, username, password, version);
  };

  exports.createClient = createClient;

}).call(this);
