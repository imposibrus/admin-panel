
var express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    formidable = require('formidable'),
    mkdirp = require('mkdirp'),
    fs = require('fs'),
    path = require('path'),
    Q = require('q'),
    gm = require('gm'),
    adminConfig = require('../admin-config'),
    models = require('../models');


Q.longStackSupport = true;

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
        var promises = collection.map(function(document) {return populateItem(document, modelConfig.populate);});
        Q.all(promises).then(function(populatedDocuments) {
            res.render('admin/list', {
                modelConfig: modelConfig,
                adminConfig: adminConfig,
                collection: populatedDocuments
            });
        });
    });
});

/**
 * Populate Mongoose document by given paths
 * @param {object} document - Mongoose document
 * @param {(string|string[])} populate - String or Array of Strings to populate
 * @returns {Q.promise}
 */
var populateItem = function populateItem(document, populate) {
    var populationDefer = Q.defer();
    if(!_.isEmpty(document) && !_.isEmpty(populate)) {
        document.populate(populate, function(err, populatedItem) {
            if(err) {
                return populationDefer.reject(err);
            }
            populationDefer.resolve(populatedItem);
        });
    } else {
        populationDefer.resolve(document);
    }
    return populationDefer.promise;
};

/**
 * Check if any of fields has options
 * property type of function and calculate it
 * @param {object} modelConfig - config object
 * @returns {Q.promise}
 */
var calcOptions = function calcOptions(modelConfig) {
    var optionsPromises = [];
    _.each(modelConfig.fields, function(field) {
        if(field.options && typeof field.options == 'function') {
            var optionDefer = Q.defer();
            field.options(function(err, options) {
                if(err) {
                    return optionDefer.reject(err);
                }
                field.options = options;
                optionDefer.resolve();
            });
            optionsPromises.push(optionDefer.promise);
        }
    });
    return Q.all(optionsPromises);
};

var controlsFolder = path.resolve(__dirname, '..', 'views', 'admin', 'controls');

var renderControls = function renderControls(res, modelConfig, document) {
    var renderPromises = [],
        defaultController = require(path.join(controlsFolder, '_default'));

    _.each(modelConfig.fields, function(field, fieldName) {
        var defer = Q.defer();
        field.id = modelConfig.name + '_' + fieldName;
        field.class = _.compact(['form-control', field.class]).join(' ');
        field.name = fieldName;
        field.caption = field.label || field.name;
        field.value = document ? document[fieldName] : '';
        defaultController(res, field, document, function(err, html) {
            if(err) {
                return defer.reject(err);
            }
            defer.resolve(html);
        });
        renderPromises.push(defer.promise);
    });
    return Q.all(renderPromises);
};

var getDocumentById = function(id, modelConfig) {
    var defer = Q.defer();
    if(id == 'new') {
        defer.resolve({});
    } else {
        models[modelConfig.model].findById(id).exec(function(err, document) {
            if(err) {
                return defer.reject(err);
            }
            defer.resolve(document);
        });
    }
    return defer.promise;
};

router.get('/edit/:collection/:id', function(req, res, next) {
    var collection = req.params.collection,
        id = req.params.id,
        modelConfig = _.find(adminConfig.collections, {name: collection});

    getDocumentById(id, modelConfig)
        .then(function(document) {
            return populateItem(document, modelConfig.populate)
                .then(function(populatedDocument) {
                    return calcOptions(modelConfig).then(function() {
                        return [
                            renderControls(res, modelConfig, populatedDocument),
                            populatedDocument
                        ];
                    });
                });
        })
        .spread(function(controlsHTML, populatedDocument) {
            res.render('admin/edit', {
                modelConfig: modelConfig,
                item: populatedDocument,
                controlsHTML: controlsHTML
            });
        })
        .catch(function(err) {
            next(err);
        });
});

var parseImages = function(body, modelConfig) {
  var imagesFields = [];
  _.each(modelConfig.fields, function(field, fieldName) {
    if(field.type == 'image') {
      imagesFields.push({fieldName: fieldName, field: field});
    }
  });
  imagesFields.forEach(function(imageField) {
    var newField = [],
        jsonField = JSON.parse(body[imageField.fieldName]);

    jsonField.forEach(function(image) {
      var obj = {};
      obj[imageField.field.originalField] = image[imageField.field.originalField];
      if(imageField.field.preview && imageField.field.preview.field) {
        obj[imageField.field.preview.field] = image[imageField.field.preview.field];
      }
      newField.push(obj);
    });
    body[imageField.fieldName] = newField;
  });

  return _.pluck(imagesFields, 'fieldName');
};

router.post('/edit/:collection/:id', function(req, res) {
    var collection = req.params.collection,
        id = req.params.id,
        modelConfig = _.find(adminConfig.collections, {name: collection});

    if(id == 'new') {
        new models[modelConfig.model](req.body).save(function(err) {
            if(err) {
                return res.send({status: 500, err: err}, 500);
            }
            res.redirect('/admin/list/' + collection);
        });
    } else {
        models[modelConfig.model].findById(id).exec(function(err, item) {
            if(err) {
                return res.send({status: 500, err: err}, 500);
            }

            var images = parseImages(req.body, modelConfig),
                originalImagesFields = _.pick(req.body, images);

            item = _.extend(item, _.omit(req.body, images));

            _.each(originalImagesFields, function(field, fieldName) {
              field.forEach(function(image) {
                item[fieldName].addToSet(image);
              });
            });

            item.save(function(err) {
                if(err) {
                    return res.send({status: 500, err: err}, 500);
                }
                res.redirect('/admin/list/' + collection);
            });
        });
    }
});

var fileUpload = require('../lib/fileUpload');

router.post('/upload', function(req, res) {

  fileUpload(req).then(function(files) {
    // FIXME: multiple files uploading
    res.send({status: 200, files: files[0]});
  }).catch(function(err) {
    res.status(500).send({status: 500, err: err});
  });
  // settings
    // originalField
    // array
    // preview
    // watermark
});

module.exports = router;
