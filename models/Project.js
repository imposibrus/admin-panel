
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    humanize = require('humanize'),
    _ = require('lodash'),
    path = require('path'),
    Q = require('q');

var projectsSchema = new Schema({
  title: {type: String, required: true},
  desc: {type: String},
  solution: {type: String},
  result: {type: String},
  images: [
    {
      original: String,
      preview: String
    }
  ],
  videos: [
    {
      url: String,
      videoId: String,
      videoSource: String
    }
  ],
  user: {
    name: {type: String},
    phone: {type: String},
    email: {type: String}
  },
  user_id: {type: Schema.Types.ObjectId, ref: 'User'},
  social_links: [String],
  pages_links: [String],
  attachments: [
    {
      url: String,
      fileName: String
    }
  ],
  sponsors: [String],
  district: {type: Schema.Types.ObjectId, ref: 'District'},
  env_area: {type: Schema.Types.ObjectId, ref: 'Area'},
  created_at: {type: Date, default: Date.now},
  updated_at: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: false},
  position: {
    left: String,
    top: String
  },
  color: {type: String},
  size: {type: String},
  //rating: {type: Number},
  share_counter: {type: Number, default: 0},
  expert_comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
  eula: {
    significance: {type: Boolean, default: false, required: true},
    team: {type: Boolean, default: false, required: true},
    resources: {type: Boolean, default: false, required: true},
    repeat: {type: Boolean, default: false, required: true}
  },
  status: {type: Number, default: 0} // 0 - idea, 1 - in progress
});

projectsSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

projectsSchema.virtual('human_date').get(function() {
  return humanize.date('d.m.Y', this.created_at);
});

projectsSchema.virtual('rating').get(function() {
  return _.size(_.pick(this.eula, function(val) {return val === true;})) + 1;
});

projectsSchema.options.toJSON = {
  transform: function(doc, ret) {
    ret = _.pick(doc, [
      'id', 'title', 'desc', 'solution', 'result', 'images', 'videos', 'user', 'stripped_desc', 'rating',
      'pages_links', 'attachments', 'sponsors', 'district', 'env_area', 'created_at', 'updated_at',
      'is_active', 'color', 'size', 'share_counter', 'status'
    ]);
    return ret;
  }
};

/**
 * textSearch
 * @param {String} text
 * @param {Object} [options]
 * @param {Function} cb
 */
projectsSchema.statics.textSearch = function(text, options, cb) {
  if(!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  options = _.extend({
    fields: ['title', 'desc', 'solution', 'result', 'sponsors', 'user.name', 'user.phone', 'user.email'],
    limit: 20,
    query: {}
  }, options);

  var preparedRegExp = text.replace(/\(|\)|-|\\|\^|\$|\*|\+|\?|\{|\}|\.|\[|\]|\|/g, '\\$&'),
      query = {
        $or: options.fields.map(function(field) {
          var tmp = {};
          tmp[field] = new RegExp(preparedRegExp, 'i');
          return tmp;
        })
      };

  if(!_.isEmpty(options.query)) {
    query = _.extend(query, options.query);
  }

  this.find(query).limit(options.limit).exec(function(err, foundProjects) {
    if(err) {
      return cb(err);
    }

    cb(null, foundProjects);
  });
};


module.exports = mongoose.model('Project', projectsSchema);
