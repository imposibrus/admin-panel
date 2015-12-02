
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
    if(!document.isNew && !_.isEmpty(populate)) {
      document.populate(populate, function(err, populatedItem) {
        if(err) {
          return reject(err);
        }
        resolve(populatedItem);
      });
    } else {
      resolve(document);
    }
  });
};

module.exports = populateItem;
