
var Promise = require('bluebird');

var getDocumentById = function(id, modelConfig, models) {
  return new Promise(function(resolve, reject) {
    if(id == 'new') {
      resolve(new models[modelConfig.model]());
    } else {
      models[modelConfig.model].findById(id).exec(function(err, document) {
        if(err) {
          return reject(err);
        }
        resolve(document);
      });
    }
  });
};

module.exports = getDocumentById;
