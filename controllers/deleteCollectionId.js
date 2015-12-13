
var _ = require('lodash');

module.exports = function(options) {
  return function(req, res, next) {
    var collection = req.params.collection,
        id = req.params.id,
        modelConfig = _.find(options.adminConfig.collections, {name: collection});

    options.models[modelConfig.model].findById(id).exec(function(err, foundItem) {
      if(err) {
        return next(err);
      }

      foundItem.remove(function(err) {
        if(err) {
          return next(err);
        }

        res.redirect('/admin/list/' + collection);
      });
    });
  }
};
