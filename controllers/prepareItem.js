
var _ = require('lodash'),
    parseImages = require('./parseImages');

var prepareItem = function(body, item, modelConfig) {
  //var images = parseImages(body, modelConfig),
  //    originalImagesFields = _.pick(body, images);

  var manualHandledFields = {},
    arraysFields = [];

  _.each(modelConfig.fields, function(field, fieldName) {
    if (typeof field.setHandler === 'function') {
      manualHandledFields[fieldName] = field;
    } else if (field.array === true) {
      arraysFields.push({fieldName: fieldName, field: field});
    }
  });

  _.each(_.omit(body, _.map(arraysFields, 'fieldName').concat(Object.keys(manualHandledFields))), function(val, name) {
    item.set(name, val);
  });

  _.each(manualHandledFields, function(field) {
    field.setHandler(body, item, modelConfig);
  });

  arraysFields.forEach(function(arrayField) {
    var arr = _.compact((body[arrayField.fieldName] || '').split(','));

    item.set(arrayField.fieldName, arr);
  });
  //_.each(originalImagesFields, function(field, fieldName) {
  //  if(_.isArray(field)) {
  //    if(field.length > 1) {
  //      item[fieldName] = field;
  //    } else {
  //      item[fieldName] = field[0] || [];
  //    }
  //  } else {
  //    item[fieldName] = field;
  //  }
  //});

  return item;
};

module.exports = prepareItem;

