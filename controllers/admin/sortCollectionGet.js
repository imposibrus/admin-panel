
var path = require('path'),
    _ = require('lodash'),
    models = require('../../models'),
    adminConfig = require('../../admin-config'),
    viewsFolder = path.resolve(__dirname, '../..', 'views');

module.exports = function(req, res) {
  var collection = req.params.collection,
      modelConfig = _.find(adminConfig.collections, {name: collection});

  models[modelConfig.model].find().sort({order: 1, created_at: -1}).exec(function(err, foundDocuments) {
    if(err) {
      throw err;
    }

    res.render(path.join(viewsFolder, 'admin/sort'), {
      modelConfig: modelConfig,
      adminConfig: adminConfig,
      collection: foundDocuments
    });
  });
};
