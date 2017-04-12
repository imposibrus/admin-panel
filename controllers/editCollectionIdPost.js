
var _ = require('lodash'),
    prepareItem = require('./prepareItem');

module.exports = function(options) {
  return function(req, res) {
    var collection = req.params.collection,
        id = req.params.id,
        modelConfig = _.find(options.adminConfig.collections, {name: collection});

    if (id === 'new') {
      var newItem = options.models[modelConfig.model].build();

      newItem = prepareItem(req.body, newItem, modelConfig);

      newItem.save().then(function(savedItem) {
        if (req.query.json) {
          res.send({status: 200, item: savedItem});
        } else {
          res.redirect('/admin/list/' + collection);
        }
      }).catch(function(err) {
        res.status(500).send({status: 500, err: err});
      });
    } else {
      options.models[modelConfig.model].findById(id).then(function(item) {
        item = prepareItem(req.body, item, modelConfig);

        return item.save().then(function(savedItem) {
          if (req.query.json) {
            res.send({status: 200, item: savedItem});
          } else {
            res.redirect('/admin/list/' + collection);
          }
        });
      }).catch(function(err) {
        res.status(500).send({status: 500, err: err});
      });
    }
  }
};
