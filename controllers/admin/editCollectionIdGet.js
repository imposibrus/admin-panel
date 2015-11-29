
var path = require('path'),
    _ = require('lodash'),
    getDocumentById = require('./getDocumentById'),
    populateItem = require('./populateItem'),
    calcOptions = require('./calcOptions'),
    renderControls = require('./renderControls'),
    adminConfig = require('../../admin-config'),
    viewsFolder = path.resolve(__dirname, '../..', 'views');

module.exports = function(req, res, next) {
  var collection = req.params.collection,
      id = req.params.id,
      modelConfig = _.find(require('../../admin-config').collections, {name: collection});

  getDocumentById(id, modelConfig)
      .then(function(document) {
        return populateItem(document, modelConfig.populate)
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
          adminConfig: adminConfig,
          item: populatedDocument,
          controlsHTML: controlsHTML
        });
      })
      .catch(function(err) {
        next(err);
      });
};
