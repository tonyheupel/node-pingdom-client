var http    = require('http'),
    url     = require('url'),
    request = require('request');

// new Pingdom(apiKey, username, password[, version='2.0'])
Pingdom = function(apiKey, username, password, version) {
  if ( !(this instanceof Pingdom) ) {
    return new Pingdom(apiKey, username, password, version);
  }

  this.apiKey   = apiKey;
  this.username = username;
  this.password = password;
  this.checks = [];

  if (typeof version === 'undefined') version = '2.0';

  this.baseUrl = 'https://api.pingdom.com/api/' + version + '/';
}

Pingdom.toQueryString = function(options) {
  var qs = '';
  for (option in options) {
    qs += option + '=' + options[option] + '&';
  }

  return qs;
}


Pingdom.prototype = {
  getCurrentServerTime: function(dataCallback) {
    var requestUrl = this.baseUrl + 'servertime';
    this.apiCall(requestUrl, dataCallback);
  },
  
  // Memoized 
  // client.getCheckList([force=false,] dataCallback(checks))
  getCheckList: function(force, dataCallback) {
    if (arguments.length == 1) {
      dataCallback = force;
      force = false;
    }
    
    if (this.checks.length > 0 && !force) return this.checks;

    var requestUrl = this.baseUrl + 'checks';

    this.apiCall(requestUrl, function(checks) {
      this.checks = checks;
      if (dataCallback) dataCallback(checks);
    });
  },
  
  getDetailedCheckInfo: function(checkId, dataCallback) {
    var requestUrl = this.baseUrl + 'checks/' + checkId;
    this.apiCall(requestUrl, dataCallback);    
  },

  getSummaryAverage: function(checkId, options, dataCallback) {
    /*Name  Description                                     Type    Req?  Default
      from	  Start time of period. Format is UNIX timestamp	Integer	no	  0
      to	    End time of period. Format is UNIX timestamp	  Integer	no	  current time
      probes	Filter to only use results from a list of probes. Format is a comma separated list of probe identifiers	String	no	all probes
      includeuptime	Include uptime information	Boolean	no	false
      bycountry	Split response times into country groups	Boolean	no	false
      byprobe	Split response times into probe groups	Boolean	no	false */

    var requestUrl = this.baseUrl + 'summary.average/' + checkId + '/?' + Pingdom.toQueryString(options);
    this.apiCall(requestUrl, dataCallback);
  },
  
  getSummaryHoursOfDay: function(checkId, options, dataCallback) {
    /*Name        Description
    from          Start time of period. Format is UNIX timestamp	Integer	no	One week earlier than "to"
    to            End time of period. Format is UNIX timestamp	Integer	no	Current time
    probes        Filter to only use results from a list of probes. Format is a comma separated list of probe identifiers	String	no	all probes
    uselocaltime  If true, use the user's local time zone for results (from and to parameters should still be specified in UTC). If false, use UTC for results.	Boolean	no	false */
    if (!dataCallback) { dataCallback = options; options = {}; }

    var requestUrl = this.baseUrl + 'summary.hoursofday/' + checkId + '/?' + Pingdom.toQueryString(options);
    this.apiCall(requestUrl, dataCallback);
  },

  apiCall: function(requestUrl, dataCallback) {
    if (!this.auth) { this.auth = 'Basic ' + new Buffer(this.username + ':' + this.password).toString('base64'); } // Memoize the auth header
  
    var options = {
      'uri': url.parse(requestUrl),
      'headers':  { 'App-Key': this.apiKey, 'Authorization': this.auth }
    };

    var req = request(options, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        dataCallback(JSON.parse(body));
      } else {
        console.log('Error: ' + error + '\nResponse: ' + response.body);
      }
    });
  }
};

function createClient(apiKey, username, password, version) {
  return new Pingdom(apiKey, username, password, version);
}

exports.createClient = createClient;
