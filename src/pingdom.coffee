http    = require 'http'
url     = require 'url'
request = require 'request'

# new Pingdom(apiKey, username, password[, version='2.0'])
class Pingdom
  constructor: (@apiKey, @username, @password, @version='2.0') ->
    return new Pingdom(apiKey, username, password, version) unless this instanceof Pingdom
      
    @checks = []
    @baseUrl = "https://api.pingdom.com/api/#{@version}"


  getCurrentServerTime: (dataCallback) ->
    requestUrl = "#{@baseUrl}/servertime"
    @apiCall requestUrl, dataCallback

  
  # Memoized 
  # client.getCheckList([force=false,] dataCallback(checks))
  getCheckList: (force, dataCallback) ->
    if arguments.length == 1
      dataCallback = force
      force = false
    
    return @checks unless force || @checks.length == 0

    requestUrl = "#{@baseUrl}/checks"

    @apiCall requestUrl, (checks) ->
      @checks = checks
      dataCallback(checks) if dataCallback

  
  getDetailedCheckInfo: (checkId, dataCallback) ->
    requestUrl = "#{@baseUrl}/checks/#{checkId}"
    @apiCall requestUrl, dataCallback
  

  getSummaryAverage: (checkId, options, dataCallback) ->
    # Name  Description                                     Type    Req?  Default
    # from    Start time of period. Format is UNIX timestamp  Integer no    0
    # to      End time of period. Format is UNIX timestamp    Integer no    current time
    # probes  Filter to only use results from a list of probes. Format is a comma separated list of probe identifiers String  no  all probes
    # includeuptime Include uptime information  Boolean no  false
    # bycountry Split response times into country groups  Boolean no  false
    # byprobe Split response times into probe groups  Boolean no  false 

    requestUrl = "#{@baseUrl}/summary.average/#{checkId}/?#{Pingdom.toQueryString(options)}"
    @apiCall requestUrl, dataCallback
  
  
  # getSummaryHoursOfDay(checkId[, options], dataCallback)
  getSummaryHoursOfDay: (checkId, options={}, dataCallback) ->
    # Name        Description
    # from          Start time of period. Format is UNIX timestamp  Integer no  One week earlier than "to"
    # to            End time of period. Format is UNIX timestamp  Integer no  Current time
    # probes        Filter to only use results from a list of probes. Format is a comma separated list of probe identifiers String  no  all probes
    # uselocaltime  If true, use the user's local time zone for results (from and to parameters should still be specified in UTC). If false, use UTC for results. Boolean no  false */
    #if !dataCallback
    #  dataCallback = options
    #  options = {}

    requestUrl = "#{@baseUrl}/summary.hoursofday/#{checkId}/?#{Pingdom.toQueryString(options)}"
    @apiCall requestUrl, dataCallback
  

  apiCall: (requestUrl, dataCallback) ->
    @auth = 'Basic ' + new Buffer(@username + ':' + @password).toString('base64') unless @auth  # Memoize the auth header
  
    options = 
      uri: url.parse(requestUrl),
      headers:
        'App-Key': @apiKey, 
        'Authorization': @auth 

    req = request options, (error, response, body) ->
      if !error && response.statusCode == 200
        dataCallback(JSON.parse(body))
      else
        console.log "Error: #{error}\nResponse: #{response.body}"

  
  @toQueryString: (options) ->
    pairs = for key, value of options
      "#{key}=#{value}"

    pairs.join('&')
  



createClient = (apiKey, username, password, version) ->
  new Pingdom(apiKey, username, password, version)


exports.createClient = createClient
