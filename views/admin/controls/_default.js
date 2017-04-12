
var path = require('path'),
    fs = require('fs'),
    inputTypes = ['text', 'number', 'email', 'tel'];

module.exports = function(res, field, document, customControlsDir, cb) {
  var controlType = field.type;

  if (inputTypes.indexOf(field.type) !== -1) {
    controlType = 'text';
  }

  var customControlPath = customControlsDir && path.join(customControlsDir, controlType),
      localControlPath = path.join(__dirname, controlType),
      controlPath = customControlPath && (fs.existsSync(customControlPath + '.js') || fs.existsSync(customControlPath + '.jade')) ? customControlPath : localControlPath;

  if (fs.existsSync(controlPath + '.js')) {
    try {
      require(controlPath)(res, field, document, cb);
    } catch(e) {
      renderTemplate();
    }
  } else {
    renderTemplate();
  }

  function renderTemplate() {
    res.render(controlPath, {field: field, document: document}, cb);
  }
};
