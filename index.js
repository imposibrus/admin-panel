
var express = require('express'),
    router = express.Router(),
    adminRouter = require('./routes');

module.exports = function(options) {
  if(!options.loginCallback || typeof options.loginCallback != 'function') {
    throw new Error('`loginCallback` is required and must be Function.');
  }

  router.post('/login', options.loginCallback);

  router.use('/', adminRouter(options));

  return router;
};

