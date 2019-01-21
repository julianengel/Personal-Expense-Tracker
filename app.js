const express = require('express');
const routes = require('./routes/index');
const bodyParser = require("body-parser");
const app = express();
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');



app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.use(express.static('public'));


app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
	    mongooseConnection: mongoose.connection,
	    ttl: 14 * 24 * 60 * 60
	  }) 
}));


app.use('/', routes);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.message);
});


module.exports = app;