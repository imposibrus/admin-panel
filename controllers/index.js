
module.exports = {
  listCollection: require('./listCollection'),
  sortCollectionPost: require('./sortCollectionPost'),
  sortCollectionGet: require('./sortCollectionGet'),
  editCollectionIdGet: require('./editCollectionIdGet'),
  editCollectionIdPost: require('./editCollectionIdPost'),
  deleteCollectionId: require('./deleteCollectionId'),
  upload: require('./upload'),
  getFilesList: require('./getFilesList')
};

/**
 * @typedef {Object} ModelConfig
 * @property {Object} fields
 * @property {String[]} populate
 * @property {PopulateArray[]} populateArrays
 */

/**
 * @typedef {Object} PopulateArray
 * @property {String} field Field name for saving result
 * @property {String} model Model name
 */

/**
 * @typedef {Object} Document
 * @property {Boolean} isNewRecord
 */
