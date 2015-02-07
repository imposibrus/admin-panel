
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('lodash');

var photosSchema = new Schema({
  url: String,
  preview: String,
  path: String
}, {_id: false});

var albumsSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  user: {type: Schema.Types.ObjectId, ref: 'User'},
  photos: [photosSchema],
  text: String,
  rich: String,
  checkbox: Boolean,
  user_type: Number
});

module.exports = mongoose.model('Album', albumsSchema);

