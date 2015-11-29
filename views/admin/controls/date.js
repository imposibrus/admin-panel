
var _ = require('lodash'),
    humanize = require('humanize');

module.exports = function(res, field, document, cb) {
  var classesArray = (field.class || '').split(' ');
  if(classesArray.indexOf('datepicker') == -1) {
    classesArray.push('datepicker');
  }

  field.class = _.uniq(_.compact(classesArray)).join(' ');
  field.value = field.value ? humanize.date('Y-m-d', field.value) : '';
  res.render('admin/controls/date', {field: field, document: document}, cb);
};
