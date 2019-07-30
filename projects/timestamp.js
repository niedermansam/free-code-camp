

module.exports = function(app){


app.get("/api/timestamp/:date_string?", function(req, res){
  
  let requestedDate;
  
  let dateString = req.params.date_string // get user input
  let datePattern = /^\d{4}-\d{2}-\d{2}$/ // regular express for date pattern (xxxx-xx-xx)
  let msPattern = /^\d+$/ // regular expression to search for integer
  let format = ! dateString ? "empty" : 
                    datePattern.test(dateString) ? "utc" :
                    msPattern.test(dateString) ? "unix" : "invalid"
  
  
  switch(format){
    case "empty":
      // If date string doesn't exist, return object with current date/time
      let today = new Date()
      res.json({"unix": today.getTime(), "utc": today.toUTCString()});
      break;
    case "utc":
      // If date string follows the pattern xxxx-xx-xx parse and return date json
      let dateArray = dateString.split('-');
      requestedDate = new Date(dateArray[0], parseInt(dateArray[1]) - 1, dateArray[2]);
      res.json({"unix": requestedDate.getTime(), "utc": requestedDate.toUTCString()});
    case "unix":
      // if date string is integer, treat is as a unix time code
      requestedDate = new Date(parseInt(dateString));
      res.json({"unix": requestedDate.getTime(), "utc": requestedDate.toUTCString()});
      break;
    default:
      // In any other case, return error
      res.json({"error":"Invalid Date"})
  }
  
})

}