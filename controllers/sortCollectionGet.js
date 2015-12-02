
var path = require('path'),
    _ = require('lodash'),
    viewsFolder = path.resolve(__dirname, '..', 'views');

module.exports = function(options) {
  return function(req, res) {
    var collection = req.params.collection,
        modelConfig = _.find(options.adminConfig.collections, {name: collection});

    options.models[modelConfig.model].find().sort({order: 1, created_at: -1}).exec(function(err, foundDocuments) {
      if(err) {
        throw err;
      }

      res.render(path.join(viewsFolder, 'admin/sort'), {
        modelConfig: modelConfig,
        adminConfig: options.adminConfig,
        collection: foundDocuments
      });
    });
  }
};
