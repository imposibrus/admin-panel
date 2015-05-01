
var express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    mkdirp = require('mkdirp'),
    fs = require('fs'),
    path = require('path'),
    Q = require('q'),
    gm = require('gm'),
    adminConfig = require('../admin-config'),
    models = require('../models');


Q.longStackSupport = true;

router.post('/login', function(req, res) {
  var login = req.body.login,
      pass = req.body.pass,
      credentials = {login: 'admin', pass: 'admin'};

  if(login == credentials.login && pass == credentials.pass) {
    req.session.auth = true;
    res.redirect('/admin');
  } else {
    res.render('admin/login', {session: req.session});
  }
});


router.get('/logout', function(req, res) {
  req.session.destroy(function() {
    res.redirect('/');
  });
});

router.get('/login', function(req, res) {
  if(!req.session || !req.session.auth) {
    return res.render('admin/login', {session: req.session});
  }
  res.redirect('/admin');
});

router.use('/', function(req, res, next) {
  if(!req.session || !req.session.auth) {
    return res.redirect('/admin/login');
  } else {
    next();
  }
});


//new models.User({
//    name: 'more users!',
//    password: 'pass #2'
//}).save(function() {});

router.get('/', function(req, res) {
    res.render('admin/index', {adminConfig: adminConfig});
});

router.get('/list/:collection', function(req, res) {
    var collection = req.params.collection;
    var modelConfig = _.find(adminConfig.collections, {name: collection});
    models[modelConfig.model].find({}).sort({order: 1, created_at: -1}).exec(function(err, collection) {
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

router.post('/sort/:collection', function(req, res) {
  var sortArr = req.body.sort,
      collection = req.params.collection,
      modelConfig = _.find(adminConfig.collections, {name: collection}),
      promises = [];

  _.forEach(sortArr, function(order, id) {
    var defer = Q.defer();
    models[modelConfig.model].findOneAndUpdate({_id: id}, {order: ~~order}).exec(function(err/*, updated*/) {
      if(err) {
        return defer.reject(err);
      }

      defer.resolve();
    });
    promises.push(defer.promise);
  });

  Q.all(promises).done(function() {
    res.send({status: 200});
  }, function(err) {
    console.log(err);
    res.status(500).send({status: 500, err: err});
  });

});

router.get('/sort/:collection', function(req, res) {
  var collection = req.params.collection,
      modelConfig = _.find(adminConfig.collections, {name: collection});

  models[modelConfig.model].find().sort({order: 1, created_at: -1}).exec(function(err, foundDocuments) {
    if(err) {
      throw err;
    }

    res.render('admin/sort', {
      modelConfig: modelConfig,
      adminConfig: adminConfig,
      collection: foundDocuments
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
    if(!document.isNew && !_.isEmpty(populate)) {
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
    var optionsPromises = [],
        calculate = function(field) {
          var optionDefer = Q.defer();
          field.options(function(err, options) {
            if(err) {
              return optionDefer.reject(err);
            }
            field.calculatedOptions = options;
            optionDefer.resolve();
          });
          return optionDefer.promise;
        };

    _.each(modelConfig.fields, function(field) {
        if(field.options && typeof field.options == 'function') {
            optionsPromises.push(calculate(field));
        }
        if(field._nestedSchema && field._nestedSchema.fields) {
            optionsPromises.push(calcOptions(field._nestedSchema));
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
        var classesArray = (field.class || '').split(' ');
        if(classesArray.indexOf('form-control') == -1) {
          classesArray.push('form-control');
        }

        field.class = _.uniq(_.compact(classesArray)).join(' ');
        field.name = fieldName;
        field.caption = field.label || field.name;
        field.value = document.get(fieldName) || '';
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
        defer.resolve(new models[modelConfig.model]());
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
        modelConfig = _.find(require('../admin-config').collections, {name: collection});

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
                adminConfig: adminConfig,
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

    if(_.isArray(jsonField)) {
      jsonField.forEach(function(image) {
        var obj = {};
        obj[imageField.field.originalField] = image[imageField.field.originalField];
        if(imageField.field.previews && image.previews) {
          obj.previews = {};
          _.each(imageField.field.previews, function(previewParams, key) {
            obj.previews[key] = image.previews[key];
          });
        }
        newField.push(obj);
      });
    } else {
      newField = {};
      newField[imageField.field.originalField] = jsonField[imageField.field.originalField];
      if(imageField.field.previews && jsonField.previews) {
        newField.previews = {};
        _.each(imageField.field.previews, function(previewParams, key) {
          newField.previews[key] = jsonField.previews[key];
        });
      }
    }
    body[imageField.fieldName] = newField;
  });

  return _.pluck(imagesFields, 'fieldName');
};

var prepareItem = function(body, item, modelConfig) {
  var images = parseImages(body, modelConfig),
      originalImagesFields = _.pick(body, images);

  _.each(_.omit(body, images), function(val, name) {
    item.set(name, val);
  });

  _.each(originalImagesFields, function(field, fieldName) {
    if(_.isArray(field)) {
      if(field.length > 1) {
        item[fieldName] = field;
      } else {
        item[fieldName] = field[0];
      }
    } else {
      item[fieldName] = field;
    }
  });

  return item;
};

router.post('/edit/:collection/:id', function(req, res) {
  var collection = req.params.collection,
      id = req.params.id,
      modelConfig = _.find(adminConfig.collections, {name: collection});

  if(id == 'new') {
    var newItem = new models[modelConfig.model]();

    newItem = prepareItem(req.body, newItem, modelConfig);

    newItem.save(function(err) {
      if(err) {
        return res.status(500).send({status: 500, err: err});
      }

      res.redirect('/admin/list/' + collection);
    });
  } else {
    models[modelConfig.model].findById(id).exec(function(err, item) {
      if(err) {
        return res.status(500).send({status: 500, err: err});
      }

      item = prepareItem(req.body, item, modelConfig);

      item.save(function(err) {
        if(err) {
          return res.status(500).send({status: 500, err: err});
        }

        res.redirect('/admin/list/' + collection);
      });
    });
  }
});

router.get('/delete/:collection/:id', function(req, res, next) {
  var collection = req.params.collection,
      id = req.params.id,
      modelConfig = _.find(adminConfig.collections, {name: collection});

  models[modelConfig.model].remove({_id: id}).exec(function(err) {
    if(err) {
      return next(err);
    }

    res.redirect('/admin/list/' + collection);
  });
});

var genImagePreviews = function(options) {
  var defer = Q.defer(),
      maxEdge = _.max([options.previewParams.width, options.previewParams.height]);

  gm(options.newFilePath)
      .resize(maxEdge, maxEdge + '^')
      .gravity('Center')
      .crop(options.previewParams.width, options.previewParams.height)
      .noProfile()
      .write(options.previewPath, function(err) {
        if(err) {
          console.log(err);
          return defer.reject(err);
        }

        var previewObject = {};
        previewObject[options.previewParams.width + 'x' + options.previewParams.height] = {
          url: options.previewUrl,
          path: options.previewPath
        };
        defer.resolve(previewObject);
      });

  return defer.promise;
};

router.post('/upload', function(req, res) {
  var uploadFolderPath = path.resolve(__dirname, '..', 'public/storage/' + req.query.folder),
      filesPromises = [],
      settings = req.query.settings,
      previews = settings.previews;

  if(!fs.existsSync(uploadFolderPath)) {
    mkdirp.sync(uploadFolderPath);
  }

  _.each(req.files, function(file) {
    var fileDefer = Q.defer(),
        userFolder = '/public/storage/' + req.query.folder,
        newFilename = file.hash + path.extname(file.name),
        newFilePath = path.join(uploadFolderPath, newFilename),

        userUrl = path.join(userFolder, newFilename);

    fs.createReadStream(file.path).pipe(fs.createWriteStream(newFilePath)).on('close', function() {
      fs.unlink(file.path, function (err) {
        if(err) {
          console.log(err);
        }
      });

      var previewsPromises = [];

      if(!_.isEmpty(previews)) {
        _.each(previews, function(previewParams) {
          var previewName = newFilename.replace(
              file.hash, file.hash + '_preview'+ previewParams.width +'x'+ previewParams.height
          );
          var options = {
            previewUrl: path.join(userFolder, previewName),
            previewPath: path.join(uploadFolderPath, previewName),
            newFilePath: newFilePath,
            previewParams: previewParams
          };

          previewsPromises.push(genImagePreviews(options));
        });
      }

      Q.all(previewsPromises).done(function(previewsObjects) {
        var resp = {};
        resp[settings.originalField] = userUrl;
        if(!_.isEmpty(previewsObjects)) {
          resp.previews = {};
          previewsObjects.forEach(function(previewParams) {
            resp.previews = _.extend(resp.previews, previewParams);
          });
        }

        fileDefer.resolve(resp);
      }, function(err) {
        fileDefer.reject(err);
      });
    }).on('error', function(err) {
      res.status(500).send({status: 500, err: err});
    });

    filesPromises.push(fileDefer.promise);
  });

  Q.all(filesPromises).done(function(files) {
    res.send({status: 200, files: files});
  }, function(err) {
    res.status(500).send({status: 500, err: err});
  });
});

module.exports = router;
