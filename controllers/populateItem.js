
var Promise = require('bluebird'),
    _ = require('lodash');

/**
 * Populate Mongoose document by given paths
 * @param {object} document - Mongoose document
 * @param {(string|string[])} populate - String or Array of Strings to populate
 * @returns {Promise|*}
 */
var populateItem = function populateItem(document, populate) {
  return new Promise(function(resolve, reject) {
    if(!document.isNewRecord && !_.isEmpty(populate)) {
      Promise.resolve(populate).map(function(modelName) {
        return document['get' + modelName]().then(function(populated) {
          var obj = {};
          obj.modelName = modelName;
          obj.value = populated;
          return Promise.resolve(obj);
        });
      }).then(function(populated) {
        populated.forEach(function(field) {
          document[field.modelName] = field.value;
          console.log('populated ', field.modelName, field.value, document[field.modelName]);
        });
        resolve(document);
      }).catch(reject);
      //document.populate(populate, function(err, populatedItem) {
      //  if(err) {
      //    return reject(err);
      //  }
      //  resolve(populatedItem);
      //});
    } else {
      resolve(document);
    }
  });
};

module.exports = populateItem;
