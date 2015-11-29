
var config = require('./config'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session);

/* istanbul ignore next */
module.exports = new MongoStore({
  url: config.get('mongoose:url'),
  autoReconnect: true,
  ttl: 1000 * 60 * 60 * 24 * 2 // 48 hours
}, function() {});
