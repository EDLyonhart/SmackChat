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

//validates userPass === userName and logs in
 app.post("/globalchat", function(req, res){
  var getUserPass = function(){
    client.HGET("users", req.body.userName, function(err, reply){
      if (err){
        console.log("Could not query the database");
      }

      if (req.body.userPass == reply){
        res.redirect("/globalchat");
      } else {
        console.log("Incorrect UserName or Password");
        res.redirect('/');
      }
    });
  };
  getUserPass();
});

//start the server
http.listen(3000, function(){
  console.log('listening on *:3000');
});