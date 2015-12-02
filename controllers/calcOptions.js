
var _ = require('lodash'),
    Promise = require('bluebird');

/**
 * Check if any of fields has options
 * property type of function and calculate it
 * @param {object} modelConfig - config object
 * @returns {Q.promise}
 */
var calcOptions = function calcOptions(modelConfig) {
  var optionsPromises = [],
      calculate = function(field) {
        return new Promise(function(resolve, reject) {
          field.options(function(err, options) {
            if(err) {
              return reject(err);
            }
            field.calculatedOptions = options;
            resolve();
          });
        });
      };

  _.each(modelConfig.fields, function(field) {
    if(field.options && typeof field.options == 'function') {
      optionsPromises.push(calculate(field));
    }
    if(field._nestedSchema && field._nestedSchema.fields) {
      optionsPromises.push(calcOptions(field._nestedSchema));
    }
  });
  return Promise.all(optionsPromises);
};

module.exports = calcOptions;
