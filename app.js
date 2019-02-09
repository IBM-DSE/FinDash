if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const sassMiddleware = require('node-sass-middleware');

const index = require('./routes/index');
const clients = require('./routes/clients');
const stocks = require('./routes/stocks');

const app = express();

// Redirect http to https if we're in production
if (process.env.NODE_ENV === 'production')
  app.use(requireHTTPS);

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/clients', clients);
app.use('/api/stocks', stocks);

if ((process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test')) {
  app.use(express.static(path.join(__dirname, 'client/build')));
  app.use('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
} else {
  app.use('/', index);
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

function requireHTTPS(req, res, next) {
  if (req.headers && req.headers.$wssp === "80") {
    return res.redirect('https://' + req.get('host') + req.url);
  }
  next();
}

module.exports = app;
