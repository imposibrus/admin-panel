
var _ = require('lodash');

var parseImages = function(body, modelConfig) {
  var imagesFields = [];
  _.each(modelConfig.fields, function(field, fieldName) {
    if(field.type == 'image') {
      imagesFields.push({fieldName: fieldName, field: field});
    }
  });
  imagesFields.forEach(function(imageField) {
    var newField = [],
        jsonField = JSON.parse(body[imageField.fieldName]);

    if(_.isArray(jsonField)) {
      jsonField.forEach(function(image) {
        var obj = {};
        obj[imageField.field.originalField] = image[imageField.field.originalField];
        if(imageField.field.pathField) {
          obj[imageField.field.pathField] = image[imageField.field.pathField];
        }
        if(imageField.field.previews && image.previews) {
          obj.previews = {};
          _.each(imageField.field.previews, function(previewParams, key) {
            obj.previews[key] = image.previews[key];
          });
        }
        newField.push(obj);
      });
    } else {
      newField = {};
      newField[imageField.field.originalField] = jsonField[imageField.field.originalField];
      if(imageField.field.pathField) {
        newField[imageField.field.pathField] = jsonField[imageField.field.pathField];
      }
      if(imageField.field.previews && jsonField.previews) {
        newField.previews = {};
        _.each(imageField.field.previews, function(previewParams, key) {
          newField.previews[key] = jsonField.previews[key];
        });
      }
    }
    body[imageField.fieldName] = newField;
  });

  return _.pluck(imagesFields, 'fieldName');
};

module.exports = parseImages;
