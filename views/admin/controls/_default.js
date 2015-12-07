
var path = require('path'),
    inputTypes = ['text', 'number', 'email', 'tel'];

module.exports = function(res, field, document, cb) {
  var controlType = field.type;
  if(inputTypes.indexOf(field.type) != -1) {
    controlType = 'text';
  }
  try {
    require('./' + controlType)(res, field, document, cb);
  } catch(e) {
    res.render(path.join(__dirname, controlType), {field: field, document: document}, cb);
  }
};
