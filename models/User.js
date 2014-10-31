
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('lodash');

var usersSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  photos: {
    preview: {
      50: String,
      100: String
    },
    original: String
  }
});

module.exports = mongoose.model('User', usersSchema);

