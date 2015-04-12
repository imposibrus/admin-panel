
var config = require('./config'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session);

module.exports = new MongoStore({
    url: config.get('mongoose:url'),
    autoReconnect: true
  }, function() {});
