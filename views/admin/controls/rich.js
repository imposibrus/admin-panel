
module.exports = function(res, field, document, cb) {
  field.class = [field.class, 'tinymce'].join(' ');
  res.render('admin/controls/textarea', {field: field, document: document}, cb);
};
