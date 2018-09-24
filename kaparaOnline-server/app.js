var createError = require('http-errors');
var express = require('express');
var path = require('path');
const upload = require('express-fileupload');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
//passport
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
//mongoose
const mongoose = require('mongoose');

//routes - api
var homeRouter = require('./routes/home');
var usersRouter = require('./routes/users');
var storeRouter = require('./routes/store');


var app = express();
mongoose.connect('mongodb://localhost:27017/kaparaOnline', { useNewUrlParser: true });

app.use(logger('dev'));
app.use(express.json());
app.use(upload());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//express-session for passport too
app.use(session({
  secret: '^%@ZIPo5c333h55emDc4lX*4365gfdh75gj43DFdgfdh54554*34FFG3243465(MUS555TA22CHE)}}45465})(({{rr(****frtr',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: (3600000 * 720) } // 3600000 Equals 1 Hour * 720 is 1 month. 24*30 = 720
}));
app.use(passport.initialize());
app.use(passport.session());


app.use(express.static(path.join(__dirname, 'build')));

//set up passport
var User = require('./models/user.model');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use('/home', homeRouter);
app.use('/users', usersRouter);
app.use('/store', storeRouter);
app.all('/*', function(req, res, next) {
  // Just send the index.html for other files to support HTML5Mode
  res.sendFile('build/index.html', { root: __dirname });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
