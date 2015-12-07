
var _ = require('lodash');

module.exports = function(options) {
  return function(req, res, next) {
    var collection = req.params.collection,
        id = req.params.id,
        modelConfig = _.find(options.adminConfig.collections, {name: collection});

    options.models[modelConfig.model].remove({_id: id}).exec(function(err) {
      if(err) {
        return next(err);
      }

      res.redirect('/admin/list/' + collection);
    });
  }
};
