/* ============ EXAMPLE USAGE ==============*/
var pd = createClient('kfgxuj9hdjs3099ozen180e4tbbhepx5h', 'alerts-notify-url-pingdom@somecompany.com', 'FooBarBaz');


pd.getCheckList(function(data) {
  var checkList = data.checks;
    
  pd.getCurrentServerTime(function(data) { 
    var currentServerTime = data.servertime;  // Returning seconds from call -- to get to milliseconds for JavaScript new Date(ms);
    var lastHour = currentServerTime - (60 * 60); // 60 min * 60 sec
    
    var check;
    
    var showSummary = function(check, fromTime, description) {
      var options = { from: fromTime, to: currentServerTime, includeuptime: true };

      pd.getSummaryAverage(check.id, options, function(data) {
        console.log(data.summary);
        var summary = data.summary;
        
        pd.getSummaryHoursOfDay(check.id, null /* can use from and to, defaults to the last week */, function(data) {
          var hourly = data;
          console.log('==== ' + check.name + ' ====');
          console.log('Current status: ' + check.status.toUpperCase());
          console.log('Last Test Time: ' + new Date(check.lasttesttime * 1000));
          console.log('Last Response Time: ' + check.lastresponsetime + ' ms');
        
          console.log('  = ' + description + ' =  ');
          console.log('From: ' + new Date(lastHour * 1000) + '\tTo: ' + new Date(currentServerTime * 1000)); // Date needs ms
          console.log('Total uptime: ' + summary.status.totalup + ' sec');
          console.log('Total downtime: ' + summary.status.totaldown + ' sec');
          console.log('Total unknown: ' + summary.status.totalunknown + ' sec');
          console.log('Average Response Time: ' + summary.responsetime.avgresponse + ' ms');
        
          console.log('\n  = Over the last week =');
          console.log(hourly.hoursofday);
        
          console.log('\n\n');
          
        })
                
      });

    };

    for(var i = 0; i < checkList.length; i++) {
        check = checkList[i];
        console.log(check)
       if (check.name == 'Dogpile') {  // Dogpile only
          showSummary(check, lastHour, 'LAST HOUR');
         break;                        // Dogpile only
       }                               // Dogpile only
    }
  });
});
