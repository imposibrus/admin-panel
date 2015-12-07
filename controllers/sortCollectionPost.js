
var _ = require('lodash'),
    Promise = require('bluebird');

module.exports = function(options) {
  return function(req, res) {
    var sortArr = req.body.sort,
        collection = req.params.collection,
        modelConfig = _.find(options.adminConfig.collections, {name: collection});

    Promise.resolve(sortArr).map(function(order, id) {
      return new Promise(function(resolve, reject) {
        options.models[modelConfig.model].findOneAndUpdate({_id: id}, {order: ~~order}).exec(function(err/*, updated*/) {
          if(err) {
            return reject(err);
          }

          resolve();
        });
      });
    }, {concurrency: 1}).then(function() {
      res.send({status: 200});
    }).catch(function(err) {
      console.log(err);
      res.status(500).send({status: 500, err: err});
    });
  }
};
