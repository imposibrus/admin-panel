
var path = require('path'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    controlsFolder = path.resolve(__dirname, '..', '..', 'views', 'admin', 'controls');

var renderControls = function renderControls(res, modelConfig, document) {
  var defaultController = require(path.join(controlsFolder, '_default'));

  return Promise.resolve(Object.keys(modelConfig.fields)).map(function(fieldName) {
    var field = modelConfig.fields[fieldName];
    return new Promise(function(resolve, reject) {
      field.id = modelConfig.name + '_' + fieldName;
      var classesArray = (field.class || '').split(' ');
      if(classesArray.indexOf('form-control') == -1) {
        classesArray.push('form-control');
      }

      field.class = _.uniq(_.compact(classesArray)).join(' ');
      field.name = fieldName;
      field.caption = field.label || field.name;
      field.value = document.get(fieldName) || '';
      defaultController(res, field, document, function(err, html) {
        if(err) {
          return reject(err);
        }
        resolve(html);
      });
    });
  });
};

module.exports = renderControls;
