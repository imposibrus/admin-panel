
var path = require('path'),
    _ = require('lodash'),
    getDocumentById = require('./getDocumentById'),
    populateItem = require('./populateItem'),
    calcOptions = require('./calcOptions'),
    renderControls = require('./renderControls'),
    viewsFolder = path.resolve(__dirname, '..', 'views');

module.exports = function(options) {
  return function(req, res, next) {
    var collection = req.params.collection,
        id = req.params.id,
        modelConfig = _.find(options.adminConfig.collections, {name: collection});

    getDocumentById(id, modelConfig, options.models)
        .then(function(document) {
          return populateItem(document, modelConfig.populate, options.models)
              .then(function(populatedDocument) {
                return calcOptions(modelConfig).then(function() {
                  return [
                    renderControls(res, modelConfig, populatedDocument),
                    populatedDocument
                  ];
                });
              });
        })
        .spread(function(controlsHTML, populatedDocument) {
          res.render(path.join(viewsFolder, 'admin/edit'), {
            modelConfig: modelConfig,
            adminConfig: options.adminConfig,
            item: populatedDocument,
            controlsHTML: controlsHTML
          });
        })
        .catch(function(err) {
          next(err);
        });
  }
};
