
var path = require('path'),
    _ = require('lodash'),
    humanize = require('humanize');

module.exports = function(res, field, document, cb) {
  var classesArray = (field.class || '').split(' ');
  if(classesArray.indexOf('tinymce') == -1) {
    classesArray.push('tinymce');
  }

  field.value = humanize.nl2br(field.value);

  field.class = _.uniq(_.compact(classesArray)).join(' ');
  res.render(path.join(__dirname, 'textarea'), {field: field, document: document}, cb);
};
