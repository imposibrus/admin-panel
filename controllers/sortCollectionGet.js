
var path = require('path'),
    _ = require('lodash'),
    viewsFolder = path.resolve(__dirname, '..', 'views');

module.exports = function(options) {
  return function(req, res, next) {
    var collection = req.params.collection,
        modelConfig = _.find(options.adminConfig.collections, {name: collection});

    options.models[modelConfig.model].findAll({order: [['order', 'ASC'], ['createdAt', 'DESC']]}).then(function(foundDocuments) {
      res.render(path.join(viewsFolder, 'admin/sort'), {
        modelConfig: modelConfig,
        adminConfig: options.adminConfig,
        collection: foundDocuments
      });
    }).catch(next);
  }
};
