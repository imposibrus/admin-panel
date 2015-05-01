
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var sovietsSchema = new Schema({
  name: {type: String, required: true},
  position: {type: String, required: true},
  district: {type: Schema.Types.ObjectId, ref: 'District'},
  image: {
    url: String,
    previews: {
      '220x214': {
        url: String,
        path: String
      }
    }
  },
  order: {type: Number, index: true, default: 0},
  is_other_district: {type: Boolean, default: false},
  other_district: {type: String}
});

sovietsSchema.static('getOrdered', function(done) {
  this.find({}).sort({order: 1}).exec(function(err, foundExperts) {
    if(err) {
      return done(err);
    }

    done(null, foundExperts);
  });
});

module.exports = mongoose.model('Soviet', sovietsSchema);
