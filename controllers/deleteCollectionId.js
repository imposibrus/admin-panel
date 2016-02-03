
var _ = require('lodash');

module.exports = function(options) {
  return function(req, res, next) {
    var collection = req.params.collection,
        id = req.params.id,
        modelConfig = _.find(options.adminConfig.collections, {name: collection});

    options.models[modelConfig.model].findById(id).then(function(foundItem) {
      return foundItem.destroy().then(function() {
        res.redirect('/admin/list/' + collection);
      });
    }).catch(next);
  }
};
