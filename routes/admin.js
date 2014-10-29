
var express = require('express'),
    router = express.Router(),
    adminConfig = require('../admin-config'),
    models = require('../models'),
    _ = require('lodash');

//new models.User({
//    name: 'more users!',
//    password: 'pass #2'
//}).save(function() {});

router.get('/', function(req, res) {
    res.render('admin/index', {config: adminConfig});
});

router.get('/list/:collection', function(req, res) {
    var collection = req.params.collection;
    var modelConfig = _.find(adminConfig.collections, {name: collection});
    models[modelConfig.model].find({}).exec(function(err, collection) {
        res.render('admin/list', {
            modelConfig: modelConfig,
            collection: collection
        });
    });
});

module.exports = router;
