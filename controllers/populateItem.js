
var Promise = require('bluebird'),
    _ = require('lodash');

/**
 * Populate Mongoose document by given paths
 * @param {object} document - Mongoose document
 * @param {Object} modelConfig - String or Array of Strings to populate
 * @param {Object} models
 * @returns {Promise|*}
 */
var populateItem = function populateItem(document, modelConfig, models) {
  return new Promise(function(resolve, reject) {
    if(!document.isNewRecord && (!_.isEmpty(modelConfig.populate) || !_.isEmpty(modelConfig.populateArrays))) {
      Promise.resolve(modelConfig.populate).map(function(modelName) {
        return document['get' + modelName]().then(function(populated) {
          var obj = {};
          obj.modelName = modelName;
          obj.value = populated;
          return Promise.resolve(obj);
        });
      }).then(function(populated) {
        return Promise.resolve(modelConfig.populateArrays).map(function(field) {
          return Promise.resolve(document[field.field] || []).map(function(id) {
            return models[field.model].findById(id);
          }).then(function(populated) {
            document[field.field] = populated;
            return Promise.resolve(document);
          });
        }).then(function() {
          populated.forEach(function(field) {
            document[field.modelName] = field.value;
            //console.log('populated ', field.modelName, field.value, document[field.modelName]);
          });
          resolve(document);
        });
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
