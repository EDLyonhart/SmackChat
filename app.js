// var $ = require('jquery');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require("redis");
var client = redis.createClient();
var methodOverride = require("method-override");
var Sidekiq = require("sidekiq");
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');        //for session storage (?)
var session = require('express-session');           //for session storage
//var passport = require('passport');
//var LocalStrategy = require('passport-local').Strategy;


//- - - - - - - - 
//middleware below
//- - - - - - - - 
var sessionMiddleware = session({
  secret: "expressSessionSuperSecret",
  resave: false,
  saveUninitialized: true
});
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));
app.use(cookieParser());                            //use this somehow
app.use(sessionMiddleware);
io.use(function(socket, next){
  sessionMiddleware(socket.request, {}, next);
  //console.log("socket.handshake below");
  //console.log(socket.handshake);
});


//- - - - - - - - - - - - - - -
//use Socket.io to emit messages
//- - - - - - - - - - - - - - -
  io.on('connection', function(socket){
  // userHash[name] = Socket   <- - - this is how to create/name sockets
  socket.on('chat message', function(msg){
    //socket.request.headers.cookies =  io=vUbDwgBmP_7aX0ZxAAAC; connect.sid=s%3Ar3slMW84vU_1UT9Sm09fNr5FVO-hsq2a.7ndzMruO8s4ev7CvdXgwiL0V3QyQfVU%2BCbfk%2BIzHjGY; userNameCookie=EliLyonhart2
    var w = socket.request.headers.cookie.split('; ');
    var x = w.sort();
    var y = x[2];
    var z = y.split('=');

  // - - - -
  // post a message
  // - - - -
  if (msg.length === 0 ) {
      //error message. message must have content.
    } else {
      //console.log("info = ", socket.request.headers.cookie);
      io.emit('chat message', z[z.length-1] + ": "+ msg);            //userName + chat message
    }
  });

  // - - - -
  // view a specific users information
  // - - - -
  socket.on("userReq", function(userName) {
    //console.log("username = ", userName);
    client.HGET('users', userName, function(err, data){
      if (err) {
        //console.log("error querying database");
        throw(err);
      }
      var parsedUserInfo = JSON.parse(data);                        //parsing info into usable format.
      io.emit("userInfo", parsedUserInfo);
    });
  });

  // - - - -
  // populate the currently logged in users
  // - - - -
  socket.on("loggingOut", function(loggedInList){
  });


//- - - - -
// sign out
//- - - - -
socket.on('disconnect', function () {
  console.log('disconnect outside');
  var w = socket.request.headers.cookie.split('; ');
  var x = w.sort();
  var y = x[2];
  var z = y.split('=');
    io.emit('chat message', z[z.length-1] + " has signed out");       // notify all users of the updated list
    console.log("z[1] = ", z[1]);
    client.HDEL('loggedInUsers', z[1], function(err, data){
    } );                            // remove them from the loggedInUsers list (LREM)
    client.HGETALL("loggedInUsers", function(err, data){
      var loggedInList = data;
      if (err) {
        console.log("Error querying database on logout");
        throw(err);
      } else {
        console.log("loggedInList SS = ", loggedInList);
        io.emit("currentusers", loggedInList);                              // emit users list as 'loggedInList'
      }
   });
  });                                                                 // doesnt auto update... only when the server's belly grumbles

  // - - - -
  // update && display loggedInUsers array
  // - - - -
  client.HGETALL("loggedInUsers", function(err, data){
    console.log("HGETALL data = ", data);
    io.to('loggedInUsers').emit(data);
    io.emit("currentusers", data);
  });


});

// Root Route && Login
app.get('/', function(req, res) {
  res.render('index');
});
// Render new user page
app.get('/newUser', function(req, res){
  res.render('newUser');
});


//- - - - - - - - -
// Enter global chat
//- - - - - - - - - 
app.get('/globalchat', function(req, res){
  //console.log("socket.request.headers.cookies = ", socket.request.headers.cookie);
  var w = req.headers.cookie.split('; ');
  var x = w.sort();
  var y = x[1];                                           //different number of paramaters than above... so if using a partial will need to be laid out differently.
  var z = y.split('=');
  
  client.HEXISTS("users", z[z.length-1], function(err, obj) {     // if userName is a key in the 'users' hash let in. else, redirect to 'index'
    if (obj === 1) {                                              // indicates if user exists in redis users hash
      io.emit('chat message', z[1] + ": has entered the chatroom");
      res.render('globalChat');
    } else {
      console.log("error statement inside of globalChat. rediret biatch");
      res.redirect("/");
    }
  });
});


//- - - - - - - - 
// Create new User
//- - - - - - - - 
app.post("/newuser", function(req, res){
  userInfo = JSON.stringify({userPass: req.body.userPass, name: req.body.name, email: req.body.email, city: req.body.city, loggedIn: false});
  client.HSETNX("users", req.body.userName, userInfo, function(err, success) {
    if (err) {
      //console.log("Error here.");
      res.redirect('/newUser');
    }
    if (success === 1) {
      res.redirect('/');
    } else {
      //console.log("User Name already exists or some other problem.");
      // implement AJAX error message here
    }
  });
});


// - - - - - - - - - - - - - - 
// Create new session // login
// - - - - - - - - - - - - - - 
app.post("/index", function(req, res){
  client.HGET("users", req.body.userName, function(err,data){     //getting info from database.
  // console.log("req.body.userName definded as = ", req.body.userName);

  if (err) {
      console.log("error#1");
      throw(err);
  }
    if (data === null) {
      console.log("data = ", data);   // data = null because 
      res.redirect('/');
      return new Error("Please enter a User Name and Pass");
    }

// if ((client.LINDEX('loggedInUsers', 'req.body.userName')) === 'nil'){
  // here to prevent login of users already in the loggedInUsere list
  // bad move. lists allow for duplicates and there is no easy way to check for existance of a value.
  // change this to another data structure (a seperate hash).
      var parsedUserInfo = JSON.parse(data);                          //parsing info into usable format.
      if (req.body.inputPass === parsedUserInfo.userPass){            //compare inputPass with parsedUserInfo userPas ***spelling error necessary***
        res.cookie('userNameCookie', req.body.userName, {} );

        client.HSETNX("loggedInUsers", req.body.userName, "loggedIn", function(err, success){
          if (success === 1) {
            res.redirect('/globalChat');
          } else {
            res.redirect('/');
          }
        });           //populate a hash of currently logged in users.
      } else {
        //console.log("login failure incorrect userName/userPass");
        res.redirect("/");
        return new Error("User Name and Pass don't match");
        //flash message for failure
//      }
    }
  });
});


//- - - - - - - -
//Logout function
//- - - - - - - -
app.get("/logout", function(req, res) { 
  console.log("Logged Out!!");
  res.clearCookie('userNameCookie');              // destroy the cookie
  res.redirect('/');                              // redirect
});


//- - - - - - - -
//start the server
//- - - - - - - -
http.listen(3000, function(){
  console.log('listening on *:3000');
});



