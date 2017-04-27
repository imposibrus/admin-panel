
var Promise = require('bluebird'),
    _ = require('lodash');

/**
 * Populate document by given paths
 * @param {Document} document
 * @param {ModelConfig} modelConfig
 * @param {Object} models
 * @returns {Promise.<Object>}
 */
function populateItem(document, modelConfig, models) {
    if (!document.isNewRecord && (!_.isEmpty(modelConfig.populate) || !_.isEmpty(modelConfig.populateArrays))) {
        return populateProperties(modelConfig.populate, document).then(function(document) {
            return populateArrays(modelConfig.populateArrays, models, document);
        });
    }

    return Promise.resolve(document);
}

/**
 *
 * @param {String[]} models
 * @param {Document} document
 * @returns {Promise.<Object>}
 */
function populateProperties(models, document) {
    return Promise.resolve(models).map(function(modelName) {
        return document['get' + modelName]().then(function(populated) {
            return Promise.resolve({
                modelName: modelName,
                value: populated
            });
        });
    }).then(function(populatedProperties) {
        for (var i = 0; i < populatedProperties.length; i++) {
            var prop = populatedProperties[i];

            document[prop.modelName] = prop.value;
        }

        return Promise.resolve(document);
    });
}

/**
 *
 * @param {PopulateArray[]} populateArrays
 * @param {Object} models
 * @param {Document} document
 * @returns {Promise.<Object>}
 */
function populateArrays(populateArrays, models, document) {
    if (!populateArrays || !populateArrays.length) {
        return Promise.resolve(document);
    }

    return Promise.resolve(populateArrays).map(function(item) {
        return Promise.resolve(document[item.field] || []).map(function(id) {
            return models[item.model].findById(id);
        }).then(function(populated) {
            return Promise.resolve({
                fieldName: item.field,
                value: populated
            });
        });
    }).then(function(populatedArrays) {
        for (var i = 0; i < populatedArrays.length; i++) {
            var prop = populatedArrays[i];

            document[prop.fieldName] = prop.value;
        }

        return Promise.resolve(document);
    });
}

module.exports = populateItem;
