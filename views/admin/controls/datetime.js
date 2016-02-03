
var path = require('path'),
    _ = require('lodash'),
    humanize = require('humanize');

module.exports = function(res, field, document, cb) {
  var classesArray = (field.class || '').split(' ');
  if(classesArray.indexOf('datetimepicker') == -1) {
    classesArray.push('datetimepicker');
  }

  field.class = _.uniq(_.compact(classesArray)).join(' ');
  field.value = field.value ? humanize.date('Y-m-d H:i:s', field.value) : '';
  res.render(path.join(__dirname, 'datetime'), {field: field, document: document}, cb);
};
