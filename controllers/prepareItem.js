
var _ = require('lodash'),
    Promise = require('bluebird'),
    parseImages = require('./parseImages');

var prepareItem = function(body, item, modelConfig) {
    var manualHandledFields = {},
        arraysFields = [];

    _.each(modelConfig.fields, function(field, fieldName) {
        if (typeof field.setHandler === 'function') {
            manualHandledFields[fieldName] = field;
        } else if (field.array === true) {
            arraysFields.push({fieldName: fieldName, field: field});
        }
    });

    _.each(_.omit(body, _.map(arraysFields, 'fieldName').concat(Object.keys(manualHandledFields))), function(val, name) {
        item.set(name, val);
    });

    arraysFields.forEach(function(arrayField) {
        var arr = _.compact((body[arrayField.fieldName] || '').split(','));

        item.set(arrayField.fieldName, arr);
    });

    return Promise.resolve(Object.keys(manualHandledFields)).each(function(fieldName) {
        var field = manualHandledFields[fieldName],
            result = field.setHandler(body, item, modelConfig),
            isPromise = _.isObject(result) && _.isFunction(result.then);

        return isPromise ? result : Promise.resolve(result);
    }).then(function() {
        return item;
    });
};

module.exports = prepareItem;

