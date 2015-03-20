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