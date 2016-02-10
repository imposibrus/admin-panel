
var _ = require('lodash'),
    Promise = require('bluebird');

module.exports = function(options) {
  return function(req, res) {
    var sortArr = req.body.sort,
        collection = req.params.collection,
        modelConfig = _.find(options.adminConfig.collections, {name: collection});

    Promise.resolve(sortArr).map(function(id, order) {
      return options.models[modelConfig.model].update({order: ~~order}, {where: {id: id}});
    }, {concurrency: 1}).then(function() {
      res.send({status: 200});
    }).catch(function(err) {
      console.error(err.stack);
      res.status(500).send({status: 500, err: err});
    });
  }
};
