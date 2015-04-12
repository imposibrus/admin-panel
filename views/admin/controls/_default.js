
var inputTypes = ['text', 'number', 'email', 'tel'];

module.exports = function(res, field, document, cb) {
  var controlType = field.type;
  if(inputTypes.indexOf(field.type) != -1) {
    controlType = 'text';
  }
  try {
    require('./' + controlType)(res, field, document, cb);
  } catch(e) {
    res.render('admin/controls/' + controlType, {field: field, document: document}, cb);
  }
};
