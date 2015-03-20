var express = require("express"),
 app = express(),
 redis = require("redis"),
 client = redis.createClient(),
 methodOverride = require("method-override"),
 bodyParser = require("body-parser");

//middleware below
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));

//for css/js/images
 //__dirname === 'pwd' is is the entire directory tree leading up to here.
app.use(express.static(__dirname + "/public"));

// Authenticator                                                                                                                                                                                                 
// app.use(express.basicAuth(function(user, pass, callback) {                                                                                                                                                       
//  var result = (userName === {userName: userName} && userPass === {userPass: userPass});                                                                                                                                                      
//  callback(null /* error */, result);                                                                                                                                                                             
// }));

// Root Route && Login
app.get('/', function(req, res) {
  res.send('Hello World');
});

// Render new user page
app.get('/newUser', function(req, res){
  res.render('newUser');
});


// Create new User
app.post('/newuser', function(req, res){
  client.HSETNX("users", req.body.userName, req.body.userPass, function(err, success) {
    if (success === 1) {
      res.redirect('/');
    } else {
      console.log("figure out how to show the error");
    }
  });
});

// Render global chat
app.get('/globalChat', function(req, res){
  res.send('Brah, this is the global chat.');
});



app.listen(process.env.PORT || 3000);
