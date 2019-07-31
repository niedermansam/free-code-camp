module.exports = function(app,db){
  
  // Connect to my Mongoose Database
  const mongoose = require("mongoose");
  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });
  
  const dns = require('dns');
  
  // Mount BodyParser middleware
  var bodyParser = require('body-parser')
  app.use(bodyParser.urlencoded({extended: false}))
  
  // create a Schema and model for shortened URLs
  const Schema = mongoose.Schema;
  let urlSchema = new Schema({
    original_url: {type: String, required: true},
    short_url: {type: Number, required: true}
  })
  
  let Url = mongoose.model("URL", urlSchema);
  
  

const formatUrl = function(url) {
    url = url.replace(/^https?:\/\/|www\./g, "").toLowerCase();
    return "www." + url;
}
  
  const getLatestUrl = async function(){
    return new Promise((resolve, reject) => {
      Url
        .find()
        .sort({short_url: -1}) 
        .limit(1)
        .exec((err, url) => {
        if(err) throw reject(err);
        resolve(url);
        })
    })
  }
  
  //getLatestUrl().then(x => console.log(x))
  
  const isUrlDuplicate = async function(url){
    url = formatUrl(url);
    let dbSearch = await Url.find({original_url: url})
    let isDuplicate = dbSearch[0] ? dbSearch[0] : false;
    return isDuplicate;
  }
  
  const isUrlValid = async function(url){
    url = url.replace(/^https?:\/\//, "");
    return new Promise((resolve, reject) => {
      dns.lookup(url, (err, add, fam) => {
        if(err) reject(err);
        resolve(add);
      });
    }).catch(err => false);
  }
  
  
//isUrlValid("https://www.averageanalytics.com").then(x => console.log(x))
//isUrlDuplicate("www.averageanalytics.com").then(data => console.log(data))
  
  
  app.route("/api/shorturl/:shorturl?").get((req, res) => {
    console.log(req.params);
    Url.find({short_url: req.params.shorturl}, (err, data) => {
      if (err) return console.error(err);
      let redirctUrl = "https://" + data[0].original_url
      res.status(301).redirect(redirctUrl)
    })
  }).post(async (req, res) => {
    let newUrl = formatUrl(req.body.original_url); // get URL to shorten and format it
    
    let isDuplicate = await isUrlDuplicate(newUrl)
    let isValid = await isUrlValid(newUrl)
    
    if(!isValid) { 
        // if URL is invalid, return error message
        res.json({"error":"invalid URL"});   
      
      } else if (isDuplicate) { 
        // if requested URL is already in database, return info for that URL
        res.json({"original_url": isDuplicate.original_url, "short_url": isDuplicate.short_url});
      
      }  else { 
        // if URL is valid and new, create new database entry and return results
        let lastUrl = await getLatestUrl() // get the last database entry
        let newShortUrl = lastUrl[0].short_url + 1 // add 1 to the short url of the last entry
        let newDbEntry = new Url({original_url: newUrl, short_url: newShortUrl}) // create new database entry
        
        newDbEntry.save((err, data) => err ? console.error(err) : data ) // submit new database entry
        
        res.json({"original_url": newUrl, "short_url": newShortUrl});
      }
    
    //Url.find((err, data) => err ? console.error(err) : console.log(data))
  })
  
}