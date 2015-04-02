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
  socket.on('chat message', function(msg){
    //socket.request.headers.cookies =  io=vUbDwgBmP_7aX0ZxAAAC; connect.sid=s%3Ar3slMW84vU_1UT9Sm09fNr5FVO-hsq2a.7ndzMruO8s4ev7CvdXgwiL0V3QyQfVU%2BCbfk%2BIzHjGY; userNameCookie=EliLyonhart2
    var w = socket.request.headers.cookie.split('; ');
    var x = w.sort();
    var y = x[2];
    var z = y.split('=');

  // post a message
    if (msg.length === 0 ) {
      //error message. message must have content.
    } else {
      console.log("info = ", socket.request.headers.cookie);
      io.emit('chat message', z[1] + ": "+ msg);    //userName + chat message
    }
  });

  //update && display loggedInUsers array
  socket.join('loggedInUsers');
    console.log("Got here");
});

// -  // socket.on('disconnect', function () {
// -  //   console.log("client disconnected");
// -  //   // remove them from the loggedInUsers list (LREM)
// -  //   // notify all users of the updated list
// -  // });
// -
//    //update && display loggedInUsers array
// -  //socket.join('loggedInUsers');
// -  client.LRANGE("loggedInUsers", 0, -1, function(err, data){
// -    //io.to('loggedInUsers').emit(data);
// -    io.emit("currentusers", data);
// -  });
// +  socket.join('loggedInUsers');
// +    console.log("Got here");
//  });




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
  var y = x[1];           //different number of paramaters than above... so if using a partial will need to be laid out differently.
  var z = y.split('=');
  //console.log("z[1] = ", z[1]);
  
  client.LRANGE("loggedInUsers", 0, -1, function(err, data){
    io.to('loggedInUsers').emit(data);
  });
  
  client.HEXISTS("users", z[1], function(err, obj) {     // if userName is a key in the 'users' hash let in. else, redirect to 'index'
    if (obj === 1) {  
      console.log("allowed into global chat");
      //on login
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
    if (success === 1) {
      res.redirect('/');
    } else {
      console.log("User Name already exists or some other problem.");
      //flash message for failure
    }
  });
});


// - - - - - - - - - - - - - - 
// Create new session // login
// - - - - - - - - - - - - - - 

app.post("/index", function(req, res){
  //console.log("client = ", client);
  client.HGET("users", req.body.userName, function(err,data){     //getting info from submitted form.
    var parsedUserInfo = JSON.parse(data);                        //parsing info into usable format.
    if (req.body.userPass === parsedUserInfo.userPas){            //compare inputPass with parsedUserInfo userPass
      res.cookie('userNameCookie', req.body.userName, {} );

      client.LPUSH("loggedInUsers", req.body.userName);
      res.redirect("/globalChat");
      //flash message for success
    } else {
      console.log("login failure");
      res.redirect("/");
      //flash message for failure
    }
  });

});


//- - - - - - - -
//Logout function
//- - - - - - - -

app.put("/globalChat", function(req, res){
  // slice out of loggedInUsers
  
  io.emit('chat message', z[1] + ": has left the chatroom");
  //remove permissions  <--- hahaha. I thought I was going to be able to get to this.
  res.redirect ('/');
});



//start the server
http.listen(3000, function(){
  console.log('listening on *:3000');
});