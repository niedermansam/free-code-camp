// server.js
// where your node app starts

//const headerParser = require('./header-parser.js')


// init project
const express = require('express');

const app = express();  
  

const timeStamp = require('./projects/timestamp.js');
timeStamp(app);
const headerParser = require('./projects/header-parser.js');
headerParser(app);
const urlShortener = require('./projects/url-shortener.js');
urlShortener(app);
const exerciseTracker = require('./projects/exercise-tracker.js')
exerciseTracker(app);
const fileMetadata = require('./projects/file-metadata.js');
fileMetadata(app);

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.listen(process.env.PORT);
//module.exports = app;