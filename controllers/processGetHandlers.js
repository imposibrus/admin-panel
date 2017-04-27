
var _ = require('lodash'),
    Promise = require('bluebird');

/**
 * Executes all `getHandler` functions in fields.
 * @param {Document} document
 * @param {ModelConfig} modelConfig
 * @returns {Promise.<Object>}
 */
function processGetHandlers(document, modelConfig) {
    var fieldsWithGetHandlers = [];

    _.each(modelConfig.fields, function(declaration, fieldName) {
        if (typeof declaration.getHandler === 'function') {
            fieldsWithGetHandlers.push({fieldName: fieldName, declaration: declaration});
        }
    });

    if (!fieldsWithGetHandlers.length) {
        return Promise.resolve(document);
    }

    return Promise.resolve(fieldsWithGetHandlers).map(function(field) {
        var result = field.declaration.getHandler(document),
            isPromise = _.isObject(result) && _.isFunction(result.then);

        if (isPromise) {
            return result.then(function(value) {
                return Promise.resolve({fieldName: field.fieldName, value: value});
            });
        }

        return Promise.resolve({fieldName: field.fieldName, value: result});
    }).then(function(results) {
        for (var i = 0; i < results.length; i++) {
            var res = results[i];

            document[res.fieldName] = res.value;
        }

        return Promise.resolve(document);
    });
}

module.exports = processGetHandlers;
