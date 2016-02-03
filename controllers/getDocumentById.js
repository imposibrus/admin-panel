
var Promise = require('bluebird');

var getDocumentById = function(id, modelConfig, models) {
  return new Promise(function(resolve, reject) {
    if(id == 'new') {
      resolve(models[modelConfig.model].build());
    } else {
      models[modelConfig.model].findById(id).then(resolve).catch(reject);
    }
  });
};

module.exports = getDocumentById;
