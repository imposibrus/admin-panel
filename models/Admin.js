
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    sha1 = require('sha1');

var adminsSchema = new Schema({
  login: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  createdAt: {type: Date, default: Date.now},
  updatedAt: {type: Date, default: Date.now}
});

adminsSchema.pre('save', function(done) {
  this.updatedAt = new Date();

  if(this.isModified('password')) {
    this.password = sha1(this.password);
  }

  done();
});

module.exports = mongoose.model('Admin', adminsSchema);
