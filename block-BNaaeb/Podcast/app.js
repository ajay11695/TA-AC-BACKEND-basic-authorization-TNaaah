var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose=require('mongoose')
var session=require('express-session')
var flash=require('connect-flash')
var MongoStore=require('connect-mongo')
var auth=require('./middleware/auth')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var podcastRouter = require('./routes/podcast');

// connect to mongodb
mongoose.connect('mongodb://127.0.0.1:27017/Podcast')
  .then(() => console.log('Connected!'));

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// set session middleware
app.use(session({
  secret:'somerandomsecret',
  resave:false,
  saveUninitialized:false,
  // store: new MongoStore({mongoUrl: 'mongodb://localhost/Podcast'})
}))

// add flash
app.use(flash())

// for user information
app.use(auth.userInfo)

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/podcast', podcastRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
