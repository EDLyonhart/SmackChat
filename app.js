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
        if (reply) {

console.log("this is the reply: " + reply);
          return;

        }
      });
    };

console.log("getUserPass returns: " + getUserPass());

    if (req.body.userPass == getUserPass()){
      console.log("if");
      res.redirect("/globalchat");
    } else {
console.log("else");
      // req.flash('warn', 'Username or Pass was incorrect');
      res.redirect('/');
    }
  });





//start the server
app.listen(3000, function(){
 console.log("Server startin on port 3000");
});
