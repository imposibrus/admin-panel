
var path = require('path'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    getDocumentById = require('./getDocumentById'),
    populateItem = require('./populateItem'),
    calcOptions = require('./calcOptions'),
    renderControls = require('./renderControls'),
    processGetHandlers = require('./processGetHandlers'),
    viewsFolder = path.resolve(__dirname, '..', 'views');

module.exports = function(options) {
    return function(req, res, next) {
        var collection = req.params.collection,
            id = req.params.id,
            modelConfig = _.find(options.adminConfig.collections, {name: collection});

        getDocumentById(id, modelConfig, options.models).then(function(document) {
            return Promise.join(
                populateItem(document, modelConfig, options.models).then(function(populatedDocument) {
                    return processGetHandlers(populatedDocument, modelConfig);
                }),
                calcOptions(modelConfig),
                function(populatedDocument)
            {
                return [
                    renderControls(res, modelConfig, populatedDocument, options),
                    populatedDocument
                ];
            });
        }).spread(function(controlsHTML, populatedDocument) {
            res.render(path.join(viewsFolder, 'admin/edit'), {
                modelConfig: modelConfig,
                adminConfig: options.adminConfig,
                item: populatedDocument,
                controlsHTML: controlsHTML
            });
        }).catch(next);
    }
};
