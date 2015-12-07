
var _ = require('lodash'),
    prepareItem = require('./prepareItem');

module.exports = function(options) {
  return function(req, res) {
    var collection = req.params.collection,
        id = req.params.id,
        modelConfig = _.find(options.adminConfig.collections, {name: collection});

    if(id == 'new') {
      var newItem = new options.models[modelConfig.model]();

      newItem = prepareItem(req.body, newItem, modelConfig);

      newItem.save(function(err, savedItem) {
        if(err) {
          return res.status(500).send({status: 500, err: err});
        }

        if(req.query.json) {
          res.send({status: 200, item: savedItem});
        } else {
          res.redirect('/admin/list/' + collection);
        }
      });
    } else {
      options.models[modelConfig.model].findById(id).exec(function(err, item) {
        if(err) {
          return res.status(500).send({status: 500, err: err});
        }

        item = prepareItem(req.body, item, modelConfig);

        item.save(function(err, savedItem) {
          if(err) {
            return res.status(500).send({status: 500, err: err});
          }

          if(req.query.json) {
            res.send({status: 200, item: savedItem});
          } else {
            res.redirect('/admin/list/' + collection);
          }
        });
      });
    }
  }
};
