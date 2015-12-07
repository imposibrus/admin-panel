
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    sha1 = require('sha1');

mongoose.connect('mongodb://localhost/admin-panel');

var adminsSchema = new Schema({
  login: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  createdAt: {type: Date, default: Date.now},
  updatedAt: {type: Date, default: Date.now}
});

var usersSchema = new Schema({
  name: {type: String, required: true},
  surname: {type: String},
  phone: {type: String},
  email: {type: String, required: true},
  photo: {
    original: String,
    preview: String
  },
  createdAt: {type: Date, default: Date.now},
  updatedAt: {type: Date, default: Date.now}
});

usersSchema.pre('save', function(done) {
  this.updatedAt = new Date();
  done();
});

adminsSchema.pre('save', function(done) {
  this.updatedAt = new Date();

  if(this.isModified('password')) {
    this.password = sha1(this.password);
  }

  done();
});

var adminModel = mongoose.model('Admin', adminsSchema);

adminModel.findOne({}).exec(function(err, foundAdmin) {
  if(err) {
    throw err;
  }

  if(!foundAdmin) {
    new adminModel({
      login: 'admin',
      password: '123',
      email: 'admin@example.com'
    }).save(function(err) {
      if(err) {
        throw err;
      }

      console.log('Admin with login `admin` and password `123` created.');
    });
  }
});

module.exports = {
  Admin: adminModel,
  User: mongoose.model('User', usersSchema),
  mongoose: mongoose
};
