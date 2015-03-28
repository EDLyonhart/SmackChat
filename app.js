var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require("redis");
var client = redis.createClient();
var methodOverride = require("method-override");
var bodyParser = require("body-parser");

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

app.get('/', function(req, res){
  res.render('index');
});

//middleware below
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));

var loggedIn = [];

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
app.post("/newuser", function(req, res){
  userInfo = JSON.stringify({userPass: req.body.userPass, name: req.body.name, email: req.body.email, city: req.body.city, loggedIn: false});
  parsedUserInfo = JSON.parse(userInfo);
  client.HSETNX("users", req.body.userName, userInfo, function(err, success) {
    if (success === 1) {
      console.log(req.body.userName);
      console.log("success, you magnificent son of a bitch!" + parsedUserInfo);
      console.log("short hand is " + userInfo);
      res.redirect('/');
    } else {
      console.log(req.body.userName);
      console.log("short hand is " + userInfo);
      console.log("User Name already exists or some other problem.");
    }
  });
});

// app.post("/newuser", function(req, res){
//   client.HSETNX("users", req.body.userName, req.body.userPass, function(err, success) {
//     if (success === 1) {
//       res.redirect('/');
//     } else {
//       console.log("User Name already exists. Figure out how to render this to the page");
//     }
//   });
// });


//validate userPass === inputPass. set 'loggedIn' to true.
app.get("/index", function(req, res){
  userInfo = JSON.stringify(client.HGET("users", req.body.userName));
  parsedUserInfo = JSON.parse(userInfo);
  if (parsedUserInfo["userPass"] === inputPass){  //"inputPass is not defined" ... i need to associate this with the input form
    console.log(parsedUserInfo);
    parsedUserInfo[loggedIn] = true;
    res.redirect("/globalChat");
    //flash message for success
  } else {
    res.redirect("/");
    //flash message for failure
  }
});

// var getUserPass = function(){
//   client.HGET("users", req.body.userName, function(err, reply){
//     if (err){
//       console.log("Could not query the database");
//     }

//     if (req.body.userPass == reply){
//       res.redirect("/globalchat");
//     } else {
//       console.log("Incorrect UserName or Password");
//       res.redirect('/');
//     }
//   });
// };
// getUserPass();


//display userName in chatField
app.post("/globalchat", function(req, res){
  var getUserName = function(){
    client.HGET(req.body.userName);
    //userName. get it. use it. display it.
  };
});

//start the server
http.listen(3000, function(){
  console.log('listening on *:3000');
});