
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/admin-panel', {autoReconnect: true});

module.exports = {
  User: require('./User'),
  Album: require('./Album'),
  Project: require('./Project'),
  District: require('./District'),
  Area: require('./Area'),
  Soviet: require('./Soviet')
};
