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

// return true/false if user exists in database.
// var checkUserName = function(){
//   client.HEXISTS("users", req.body.userName, function(err, reply){
//     if (err){
//       console.log("Database could not be queried");
//     } else {
//       if(reply == true){
//         return true;
//       } else {
//         return false;
//       }
//     }
//   });
// };

// Root Route && Login
app.get('/', function(req, res) {
 res.render('index');
});

// Render new user page
app.get('/newUser', function(req, res){
 res.render('newUser');
});

// Enter global chat
app.get('/globalchat', function(req, res){
  res.render('globalchat');
});

// Create new User
 //validate uniqueness of userName
 app.post("/newuser", function(req, res){
   client.HSETNX("users", req.body.userName, req.body.userPass, function(err, success) {
     if (success === 1) {
       res.redirect('/');
     } else {
       console.log("person already exists, figure out how to render this to the page");
     }
   });
 });



 app.post("/globalchat", function(req, res){
  var getUserPass = function(){
    console.log("req.body.userName is " + req.body.userName);
    client.HGET("users", req.body.userName, function(err, reply){
      if (err){
        console.log("Could not query the database");
      }
      console.log("quicker reply = " + reply);
      if (req.body.userPass == reply){
        console.log("worked?");
        res.redirect("/globalchat");
      } else {
        console.log("didnt worked");
        // req.flash('warn', 'Username or Pass was incorrect');
        res.redirect('/');
      }
    });
  };
  getUserPass();
});



//start the server
app.listen(3000, function(){
 console.log("Server startin on port 3000");
});
