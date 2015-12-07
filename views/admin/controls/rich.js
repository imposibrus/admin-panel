
var path = require('path'),
    _ = require('lodash');

module.exports = function(res, field, document, cb) {
  var classesArray = (field.class || '').split(' ');
  if(classesArray.indexOf('tinymce') == -1) {
    classesArray.push('tinymce');
  }

  field.class = _.uniq(_.compact(classesArray)).join(' ');
  res.render(path.join(__dirname, 'textarea'), {field: field, document: document}, cb);
};
