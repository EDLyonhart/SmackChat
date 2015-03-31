var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require("redis");
var client = redis.createClient();
var methodOverride = require("method-override");
var bodyParser = require("body-parser");

io.on('connection', function(socket){

  // grab the user name.  name = HGET("users", req.body.userName); <--how do i get the username?

  socket.on('chat message', function(msg){
    //on login
    //io.emit(name + "has entered the chatroom")
    io.emit('chat message', msg);
    //on logout
    ////io.emit(name + "has left the chatroom")
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
  console.log(localStorage.getItem("userName"));
  client.HGET("users", req.body.userName, function(err,data){
    parsedUserInfo = JSON.parse(data); 
    console.log("got here");
    console.log(req.body.userName);
    console.log(parsedUserInfo);

    if (parsedUserInfo.loggedIn === true){
      console.log("Where I want");
    //on login
    //io.emit(req.body.userName + "has entered the chatroom")
      res.render('globalChat');
    } else {
      console.log("Where I dont want");
    //display 'please log in.'
      res.redirect('index');
    }  
  });
});


// Create new User
app.post("/newuser", function(req, res){
  userInfo = JSON.stringify({userPass: req.body.userPass, name: req.body.name, email: req.body.email, city: req.body.city, loggedIn: false});
  client.HSETNX("users", req.body.userName, userInfo, function(err, success) {
    if (success === 1) {
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
      parsedUserInfo.loggedIn = true;
      res.redirect("/globalChat");
      //save userinfo somehow/somewhere?
      localStorage.setItem("userName", req.body.userName);
      localStorage.setItem("loggedIn", true);
      //flash message for success
    } else {
      console.log("login failure");
      res.redirect("/");
      //flash message for failure
    }
  });
});


//start the server
http.listen(3000, function(){
  console.log('listening on *:3000');
});