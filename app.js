var express = require('express');
var layouts = require('express-ejs-layouts');
var app = express();
server = require('http').Server(app); // Should this be global?
var socketio = require('./data/socket')

// templates
app.set('views', './views')
app.set('view engine', 'ejs')
app.use(layouts);

// middleware
var bodyParser = require('body-parser');
var session = require('express-session');

// sessions
app.use(session({secret: 'so_secret', saveUninitialized: true, resave: true}));

// params
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

// static files
app.use("/public", express.static(__dirname + '/public'));
// app.use('/static', express.static('/public'));
app.use("/socket.io", express.static(__dirname + '/node_modules/socket.io'));
app.use("/underscore", express.static(__dirname + '/node_modules/underscore'));
app.use("/jquery.finger", express.static(__dirname + '/node_modules/jquery.finger'));

// server
server.listen(process.env.PORT || 3000);

// routes
app.get('/', function(req, res){
  res.render('index.ejs')
  return;
});

app.post('/games', function(req, res) {
  var roomkey = keyGenerator();
  var username = req.body.username;
  req.session["username"] = username;
  req.session["roomkey"] = roomkey;
  // check if gameKey currently exists in redis
  // create new game
  res.redirect('/games/' + roomkey);
  return;
});

app.post('/join', function(req, res) {
  var roomkey = req.body.roomkey.toUpperCase();
  var username = req.body.username;
  req.session["username"] = username;
  req.session["roomkey"] = roomkey;
  res.redirect('/games/'+ roomkey);
  return;
})


app.get('/games/:key', function(req, res) {
  // validate key is legit
  res.render('game.ejs', {username: req.session["username"], roomkey: req.session["roomkey"]})
  return;
})

function keyGenerator(){
  var key = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (i=0; i<4; i++) {
    key += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return key;
}
