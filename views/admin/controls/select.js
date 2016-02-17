
var path = require('path'),
    _ = require('lodash');

module.exports = function(res, field, document, cb) {
  var optionsField = field.calculatedOptions ? 'calculatedOptions' : 'options',
      options = _.result(field, optionsField),
      defaultOption = _.find(options, 'default') || (field.default ? {title: field.default, val: field.default} : undefined);

  if(defaultOption) {
    options = _.reject(options, defaultOption);
  }

  res.render(path.join(__dirname, 'select'), {field: field, document: document, options: options, defaultOption: defaultOption}, cb);
};
