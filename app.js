var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const requestIp = require('request-ip');

var indexRouter = require('./routes/index');

var app = express();

app.use(requestIp.mw());

function getIPv4FromIPv6(ip) {
  if (ip.startsWith('::ffff:')) {
      return ip.replace('::ffff:', '');
  }
  return ip;
}

// Middleware to block local network IPs
app.use((req, res, next) => {
  let clientIp = req.clientIp;
  
  // Log the raw client IP address for debugging
  console.log('Raw Client IP:', clientIp);

  // Extract IPv4 part if it's an IPv6-mapped IPv4 address
  clientIp = getIPv4FromIPv6(clientIp);

  // Log the processed client IP address for debugging
  console.log('Processed Client IP:', clientIp);

  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

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
