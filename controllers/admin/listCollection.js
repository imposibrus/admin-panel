
var path = require('path'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    models = require('../../models'),
    adminConfig = require('../../admin-config'),
    populateItem = require('./populateItem'),
    viewsFolder = path.resolve(__dirname, '../..', 'views');

module.exports = function(req, res, next) {
  var collection = req.params.collection;
  var modelConfig = _.find(adminConfig.collections, {name: collection});
  models[modelConfig.model].find({}).sort({order: 1, created_at: -1}).exec(function(err, collection) {
    Promise.resolve(collection).map(function(document) {
      return populateItem(document, modelConfig.populate);
    }).then(function(populatedDocuments) {
      var templateName = 'list';
      if(modelConfig.templates && modelConfig.templates.list) {
        templateName = path.basename(modelConfig.templates.list, path.extname(modelConfig.templates.list));
      }
      res.render(path.join(viewsFolder, 'admin/' + templateName), {
        modelConfig: modelConfig,
        adminConfig: adminConfig,
        collection: populatedDocuments
      });
    }).catch(next);
  });
};

