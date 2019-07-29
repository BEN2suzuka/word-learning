var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helmet = require('helmet');
var session = require('express-session');
var passport = require('passport');
var Strategy = require('passport-twitter').Strategy;
var config = require('./config');

var User = require('./models/user');
var Wordgroup = require('./models/wordgroup');
var Word = require('./models/word');
var Memory = require('./models/memory');
var Favorite = require('./models/favorite');
User.sync().then(() => {
  Wordgroup.belongsTo(User, { foreignKey: 'createdBy' });
  Wordgroup.sync().then(() => {
    Favorite.belongsTo(Wordgroup, { foreignKey: 'wordGroupId' });
    Favorite.sync();
  });
  Word.sync();
  Memory.sync();
});

var indexRouter = require('./routes/index');
var wordsRouter = require('./routes/words');
var wordGroupsRouter = require('./routes/wordgroups');
var memoriesRouter = require('./routes/memories');

passport.use(new Strategy({
  consumerKey: config.twitter.consumerKey,
  consumerSecret: config.twitter.consumerSecret,
  callbackURL: config.twitter.callbackURL
},
  function (token, tokenSecret, profile, done) {
    process.nextTick(function () {
      User.upsert({
        userId: profile.id,
        username: profile.username
      }).then(() => {
        done(null, profile);
      });
    });
  }
));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

var app = express();
app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ secret: '380f3486ea148d3c', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/words', wordsRouter);
app.use('/wordgroups', wordGroupsRouter);
app.use('/wordgroups', memoriesRouter);

app.get('/login',
  passport.authenticate('twitter')
);

app.get('/oauth_callback',
  passport.authenticate('twitter', { failureRedirect: '/' }),
  function (req, res) {
    res.redirect('/');
  }
);

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/');
}

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
