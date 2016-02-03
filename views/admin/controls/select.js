
var path = require('path'),
    _ = require('lodash');

//console.log('select.js');
module.exports = function(res, field, document, cb) {
  //console.log('select.js field', field);
  var optionsField = field.calculatedOptions ? 'calculatedOptions' : 'options';
  var options = _.result(field, optionsField);

  //console.log('options', options);
  //if(options.then) {
  //  console.log('has options.then');
  //  options.then(function(options) {
  //    console.log('options.then completed', arguments);
  //    res.render(path.join(__dirname, 'select'), {field: field, document: document, options: options}, cb);
  //  }).catch(cb);
  //} else {
    res.render(path.join(__dirname, 'select'), {field: field, document: document, options: options}, cb);
  //}
};
