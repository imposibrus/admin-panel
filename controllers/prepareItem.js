
var _ = require('lodash'),
    parseImages = require('./parseImages');

var prepareItem = function(body, item, modelConfig) {
  var images = parseImages(body, modelConfig),
      originalImagesFields = _.pick(body, images);

  _.each(_.omit(body, images), function(val, name) {
    item.set(name, val);
  });

  _.each(originalImagesFields, function(field, fieldName) {
    if(_.isArray(field)) {
      if(field.length > 1) {
        item[fieldName] = field;
      } else {
        item[fieldName] = field[0] || [];
      }
    } else {
      item[fieldName] = field;
    }
  });

  return item;
};

module.exports = prepareItem;

