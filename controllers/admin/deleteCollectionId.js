
var _ = require('lodash'),
    models = require('../../models'),
    adminConfig = require('../../admin-config');

module.exports = function(req, res, next) {
  var collection = req.params.collection,
      id = req.params.id,
      modelConfig = _.find(adminConfig.collections, {name: collection});

  models[modelConfig.model].remove({_id: id}).exec(function(err) {
    if(err) {
      return next(err);
    }

    res.redirect('/admin/list/' + collection);
  });
};
