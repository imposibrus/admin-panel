
var express = require('express'),
    path = require('path'),
    http = require('http'),
    logger = require('morgan'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),

    formidable = require('formidable'),
    postNormalize = function(req, res, next) {
      if(/multipart\/form-data/.test(req.get('content-type'))) {
        var form = new formidable.IncomingForm();
        form.hash = 'md5';
        form.parse(req, function(err, fields, files) {
          if(err) {
            next(err);
          }
          req.files = files;
          req.body = fields;
          next();
        });
      } else {
        next();
      }
    },

    app = express();

app.set('port', 3000);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

/* istanbul ignore next */
if(app.get('env') === 'development') {
  app.use(logger('dev'));
  //app.locals.pretty = true;
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'sessionSecret',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    url: 'mongodb://localhost/admin-panel',
    autoReconnect: true,
    ttl: 1000 * 60 * 60 * 24 * 2 // 48 hours
  }, function() {})
}));

app.use(postNormalize);

app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});

var adminPanel = require('../..')({
  models: require('./models'),
  adminConfig: require('./admin-config'),
  storagePath: path.join(__dirname, 'public/storage')
});

app.use('/admin', adminPanel);

http.createServer(app).listen(app.get('port'));
