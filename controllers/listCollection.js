
var path = require('path'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    populateItem = require('./populateItem'),
    viewsFolder = path.resolve(__dirname, '..', 'views');

module.exports = function(options) {
  return function(req, res, next) {
    var collection = req.params.collection;
    var modelConfig = _.find(options.adminConfig.collections, {name: collection});
    options.models[modelConfig.model].findAll({order: [/*['order', 'ASC'], */['createdAt', 'DESC']]}).then(function(collection) {
      return Promise.resolve(collection).map(function(document) {
        return populateItem(document, modelConfig.populate, options.models);
      }).then(function(populatedDocuments) {
        var templateName = 'list';
        if(modelConfig.templates && modelConfig.templates.list) {
          templateName = path.basename(modelConfig.templates.list, path.extname(modelConfig.templates.list));
        }
        res.render(path.join(viewsFolder, 'admin/' + templateName), {
          modelConfig: modelConfig,
          adminConfig: options.adminConfig,
          collection: populatedDocuments
        });
      });
    }).catch(next);
  }
};

