module.exports = function(app) {
  //const formidableMiddleware = require('express-formidable');
  //app.use(formidableMiddleware())
  const fileUpload = require('express-fileupload');
  app.use(fileUpload());
  
  var bodyParser = require('body-parser');
  app.use(bodyParser.urlencoded({extended: false}));
  
  app.post('/api/fileanalyse', (req, res) => {
          let myFile = req.files.upfile
         //console.log("fields: ", req.fields)
         //console.log("files: ", req.files)
          res.json({name: myFile.name, 
                    type: myFile.mimetype, 
                    size: myFile.size
                   })
         })

}