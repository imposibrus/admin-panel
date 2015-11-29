
var mongoose = require('mongoose'),
    config = require('../lib/config'),
    connection = mongoose.connection,
    logger = require('../lib/logger').getLogger('db');

if(process.env.NODE_ENV == 'development' || process.env.NODE_ENV == 'testing') {
  mongoose.set('debug', true);
}

connection.on('error', function() {
  mongoose.disconnect();
});
connection.on('connected', function() {
  logger.debug('MongoDB connected');
});
connection.on('disconnected', function() {
  logger.debug('MongoDB disconnected!');
});
mongoose.connect(config.get('mongoose:url'), {server: {auto_reconnect: true}});

module.exports = {
  Admin: require('./Admin'),
  User: require('./User'),
  Album: require('./Album'),
  Project: require('./Project'),
  District: require('./District'),
  Area: require('./Area'),
  Soviet: require('./Soviet'),
  mongoose: mongoose
};
