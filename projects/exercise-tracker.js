module.exports = function(app){
  
  // Connect to my Mongoose Database
  const mongoose = require("mongoose");
  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });
  mongoose.set('useCreateIndex', true);
  
  // Mount BodyParser middleware
  var bodyParser = require('body-parser');
  app.use(bodyParser.urlencoded({extended: false}));
  
  const Schema = mongoose.Schema;
  let exerciseSchema = new Schema({
    username: {type: String, required: true},
    description: {type: String, required: true},
    duration: {type: Number, required: true},
    date: {type: Date, required: true}
                         })
  
  let userSchema = new Schema({
    username: {type: String, unique: true},
    count: Number,
    log: [exerciseSchema]
  })
  
  const User = mongoose.model("User", userSchema);
    //console.log("hello world")
  
  app.route('/api/exercise/new-user').post((req, res) => {
    //console.log("hello world")
    //console.log(req.body)
    let newUser = new User({username: req.body.username})
    newUser.save((err, data) => {
      if (err) { 
      err.code == 11000 ? 
        res.send(`Sorry, this username is already taken <br/> 
                  <a href="//swamp-straw.glitch.me"><button>Go Back</button></a>`) : 
        res.send(`Whoops, looks like something went wrong! Please try again <br/>`)
        return
      } 
      res.json({"username": data.username, "_id": data._id})
    })
  })
  
  app.post('/api/exercise/add', async (req, res) => {
    
    let formData = req.body; // get form data
    let exerciseDate = formData.date.split('-'); // format date input
    exerciseDate = new Date(exerciseDate[0],exerciseDate[1] - 1 ,exerciseDate[2]).toDateString();
    
    // get user data
    let getUser = await User.findOne({username: formData.userid}) // by username
    if (!getUser) getUser = await User.findById(formData.userid) // or id
    
    // init new exercise log entry
    let newLog = {username: getUser.username,
                  description: formData.description,
                  duration: formData.duration,
                  date: exerciseDate
                 }
    
    // add log entry to user profile
    getUser.log.push(newLog);
    getUser.count = getUser.log.length;
    // save user profile
    getUser.save((err, data) => err ? console.error(err) : data);
    
    // add user id to json output
    newLog._id = getUser.id;
    
    res.json(newLog) // send json
    })
  
  app.get('/api/exercise/log', async (req, res) => {
    //console.log(req.query)
    let userId = req.query.userId,
        userName = req.query.userName,
        fromDate = req.query.from,
        toDate = req.query.to,
        display = {},
        currentUser;
    
    if(userId && userName) return res.send("Please input either <strong>username</strong> or <strong>userid</strong>, not both");
    if(userId) currentUser = await User.findById(userId, (err, data) => {});
    if(userName) currentUser = await User.findOne({username: userName}, (err, data) => {});
    //console.log(currentUser.log.find({date: '2019-08-31'}));
    // console.log(new Date(currentUser.log[0].date).toDateString(), currentUser.log[0].date)
    
    let displayLog = currentUser.log.filter(entry => {
      let passes = true;
      if (fromDate && new Date(entry.date) <= new Date(fromDate)) passes = false;
      if (toDate && new Date(entry.date) >= new Date(toDate)) passes = false;
      console.log(passes)
      return passes;
    })
    
    displayLog = displayLog.map(entry => {
      let displayEntry = {description: entry.description, duration: entry.duration, date: new Date(entry.date).toDateString()}
      return displayEntry
    })
    
    display._id = currentUser._id;
    display.username = currentUser.username;
    if(fromDate) display.from = new Date(fromDate).toDateString();
    if(toDate) display.to = new Date(toDate).toDateString();
    display.count = displayLog.length;
    display.log = displayLog;
    
    
    res.json(display);
  })
  
}