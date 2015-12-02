
var express = require('express'),
    router = express.Router(),
    adminRouter = require('./routes'),
    loginCallback = require('./controllers/loginCallback');

module.exports = function(options) {
  options.loginCallback = options.loginCallback || loginCallback(options);

  router.post('/login', options.loginCallback);

  router.use('/', adminRouter(options));

  return router;
};

