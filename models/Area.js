
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var areasSchema = new Schema({
  title: {type: String, required: true},
  image: {
    url: String
  },
  order: {type: Number, index: true, default: 0}
});

areasSchema.static('getOrdered', function(done) {
  this.find({}).sort({order: 1}).exec(function(err, foundAreas) {
    if(err) {
      return done(err);
    }

    done(null, foundAreas);
  });
});

module.exports = mongoose.model('Area', areasSchema);
