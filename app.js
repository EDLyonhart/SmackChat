var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require("redis");
var client = redis.createClient();
var methodOverride = require("method-override");
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');        //for session storage (?)
var session = require('express-session');           //for session storage

//Middleware Helper
var sessionMiddleware = session({
    secret: "expressSessionSuperSecret",
    resave: false,
    saveUninitialized: true
});


//middleware below
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


//use Socket.io to emit messages
io.on('connection', function(socket){

  socket.on('chat message', function(msg){
    var nickname = "anonymous user";
    //console.log("socket.request.headers.cookies = ", socket.request.headers.cookie);
    var w = socket.request.headers.cookie.split('; ');
    var x = w.sort();
    var y = x[2];
    var z = y.split('=');     // 'z[1]' === the userName. prepend this onto the front of things. authenticate with it.
  //on login

  // post a message
    //eventually make this to the specific room being posted to.
    if (msg.length === 0 ) {
      //error message. message must have content.
    } else {
      //io.emit('chat message', storedUserName);
      io.emit('chat message', z[1] + ": "+ msg);
  }
    //on logout
    //io.emit(name + "has left the chatroom")
  });
});


app.get('/', function(req, res){
  res.render('index');
});

app.get('/', function(req,res){
  res.render('index');
});

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
  //console.log(localStorage.getItem("loggedIn"));
  console.log("req.cookies", req.cookies);
  console.log("global chat cookie", req.session);
  client.HGET("users", req.body.userName, function(err,data){
    parsedUserInfo = JSON.parse(data); 
    //console.log("got here");
    //console.log("data = " + data);
    //console.log("req.body.userName = " + req.body.userName);
    //console.log("parsedUserInfo = " + parsedUserInfo);

    if (true){
    //on login
    //io.emit(req.body.userName + "has entered the chatroom")
      res.render('globalChat');
    } else {
      //console.log("Where I dont want");
      //display 'please log in.'
      res.redirect('index');
    }  
  });
});


// Create new User
app.post("/newuser", function(req, res){
  userInfo = JSON.stringify({userPass: req.body.userPass, name: req.body.name, email: req.body.email, city: req.body.city});
  client.HSETNX("users", req.body.userName, userInfo, function(err, success) {
    if (success === 1) {
      res.redirect('/');
    } else {
      console.log("User Name already exists or some other problem.");
      //flash message for failure
    }
  });
});


// Create new session // login
app.post("/index", function(req, res){
  client.HGET("users", req.body.userName, function(err,data){     //getting info from submitted form.
    var parsedUserInfo = JSON.parse(data);                        //parsing info into usable format.
    if (req.body.userPass === parsedUserInfo.userPas){
      //req.session.cookie.userName = req.body.userName;                   //this is where session info gets saved from?
      res.cookie('userNameCookie', req.body.userName, {} );
      //storedUserName = req.session.userName;                //??? in global scope?
      console.log("req.session = ", req.session);

      // res.cookie('cookiename', 'cookievalue', { maxAge: 900000, httpOnly: true });


      //console.log("userName variable: ", storedUserName);
      res.redirect("/globalChat");
      //flash message for success
    } else {
      console.log("login failure");
      res.redirect("/");
      //flash message for failure
    }
  });
});


//Logout function




//start the server
http.listen(3000, function(){
  console.log('listening on *:3000');
});