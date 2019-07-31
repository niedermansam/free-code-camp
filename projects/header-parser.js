//console.log("hello world")
module.exports = function(app){
  
  
  
  app.get("/api/whoami", function(req, res){
    let header = req.headers;
    let ip = header['x-forwarded-for'].split(',')[0]
    res.json({"ipaddress": ip, 
              "language": header['accept-language'],
              "software": header['user-agent']
             })
  })

}