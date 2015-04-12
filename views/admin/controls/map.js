
var fs = require('fs'),
    path = require('path'),
    _ = require('lodash');

module.exports = function(res, field, document, cb) {
  field.class = _.uniq([field.class, 'map']).join(' ');

  res.render('admin/controls/map', {field: field, document: document, svgMap: fs.readFileSync(path.resolve(__dirname, '../../..', 'public/images/map.svg'))}, cb);
};
