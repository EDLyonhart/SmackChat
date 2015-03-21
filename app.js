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

// Enter global chat
app.get('/globalchat', function(req, res){

//when globalchat is accessed:
  // check to see if req.body.userPass === getUserPass
    //getUserPass is called and should return the database userPass
      //takes in the key and returns the value
  //if this is the case
    //render 'globalChat'
  //otherwise send us back to index route ('/')


//what is actually happening:
  //reply === null    path is not beign triggered
  //req.body.userName === undefined

//check userName vs userPass
  console.log("req.body.userName is " + req.body.userName);
  var getUserPass = function(){

    client.HGET("users", req.body.userName, function(err, reply){
      console.log("reply = " + reply);
      if (err){
        console.log("Could not query the database");
        return false;
      } 
      if (reply) {
        console.log("return");
        return reply;
      }
    });
  };
  
  // Signin function
  if (req.body.userPass == getUserPass()){
    res.render('globalchat');
  } else {
      // req.flash('warn', 'Username or Pass was incorrect');
      res.redirect('/');
  }
});
app.listen(process.env.PORT || 3000);
