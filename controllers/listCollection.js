
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
        return populateItem(document, modelConfig, options.models);
      }).then(function(populatedDocuments) {
        var templateName = 'list',
            templatePath = '';

        if(modelConfig.templates && modelConfig.templates.list) {
          templateName = path.basename(modelConfig.templates.list, path.extname(modelConfig.templates.list));
          if(path.isAbsolute(modelConfig.templates.list)) {
            templatePath = modelConfig.templates.list;
          } else {
            templatePath = path.join(viewsFolder, 'admin/' + templateName);
          }
        } else {
          templatePath = path.join(viewsFolder, 'admin/' + templateName);
        }

        res.render(templatePath, {
          modelConfig: modelConfig,
          adminConfig: options.adminConfig,
          collection: populatedDocuments
        });
      });
    }).catch(next);
  }
};

