
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
    var optionsPromises = [],
        calculate = function(field) {
          var optionDefer = Q.defer();
          field.options(function(err, options) {
            if(err) {
              return optionDefer.reject(err);
            }
            field.options = options;
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
        // FIXME: classes continue duplicating
        field.class = _.uniq(_.compact(['form-control', field.class])).join(' ');
        field.name = fieldName;
        field.caption = field.label || field.name;
        field.value = document.get ? document.get(fieldName) : '';
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
    // FIXME: invalidate config cache. because of populated fields saved in original config
    _.each(require.cache, function(opts, name, all) {
      if(/admin-config\.js$/.test(opts.filename)) {
        delete all[name];
      }
    });
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
        if(imageField.field.preview && imageField.field.preview.field) {
          obj[imageField.field.preview.field] = image[imageField.field.preview.field];
        }
        newField.push(obj);
      });
    } else {
      newField = {};
      newField[imageField.field.originalField] = jsonField[imageField.field.originalField];
      if(imageField.field.preview && imageField.field.preview.field) {
        newField[imageField.field.preview.field] = jsonField[imageField.field.preview.field];
      }
    }
    body[imageField.fieldName] = newField;
  });

  return _.pluck(imagesFields, 'fieldName');
};

var prepareItem = function(body, item, modelConfig) {
  var images = parseImages(body, modelConfig),
      originalImagesFields = _.pick(body, images);

  // FIXME: deep dot notation setter
  _.each(body, function(val, name, all) {
    if(name.indexOf('.') != -1) {
      var arr = name.split('.');
      if(!all[arr[0]]) {
        all[arr[0]] = {};
      }
      all[arr[0]][arr[1]] = val;
    }
  });
  item = _.extend(item, _.omit(body, images));

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
    var newItem = new models[modelConfig.model](req.body);

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

var defaultPreviewSizeWidth = 60,
    defaultPreviewSizeHeight = 60;

router.post('/upload', function(req, res) {
  var projectsUploadDir = path.resolve(__dirname, '..', 'public/storage/' + req.query.folder),
      filesPromises = [],
      settings = req.query.settings,
      preview = settings.preview,
      width,
      height,
      maxEdge;

  if(!fs.existsSync(projectsUploadDir)) {
    mkdirp.sync(projectsUploadDir);
  }

  if(preview) {
    width = preview.width || defaultPreviewSizeWidth;
    height = preview.height || defaultPreviewSizeHeight;
  } else {
    width = defaultPreviewSizeWidth;
    height = defaultPreviewSizeHeight;
  }

  maxEdge = _.max([width, height]);

  _.each(req.files, function(file) {
    var fileDefer = Q.defer();
    var userFolder = '/public/storage/' + req.query.folder,
        newFilename = file.hash + path.extname(file.name),
        newFilePreviewName = newFilename.replace(file.hash, file.hash + '_preview'+ width +'x'+ height),
        newFilePath = path.join(projectsUploadDir, newFilename),
        newFilePreviewPath = path.join(projectsUploadDir, newFilePreviewName),

        userUrl = path.join(userFolder, newFilename),
        userPreviewUrl = path.join(userFolder, newFilePreviewName);

    //fs.renameSync(file.path, newFilePath);
    fs.createReadStream(file.path).pipe(fs.createWriteStream(newFilePath)).on('close', function() {
      fs.unlink(file.path, function (err) {
        if(err) {
          console.log(err);
        }
      });

      gm(newFilePath)
          .resize(maxEdge, maxEdge + '^')
          .gravity('Center')
          .crop(width, height)
          .noProfile()
          .write(newFilePreviewPath, function(err) {
            if(err) {
              console.log(err);
              return fileDefer.reject(err);
            }

            var resp = {};
            resp[settings.originalField] = userUrl;
            if(settings.preview) {
              resp[settings.preview.field] = userPreviewUrl;
            }
            fileDefer.resolve(resp);
          });
    }).on('error', function(err) {
      res.status(500).send({status: 500, err: err});
    });

    filesPromises.push(fileDefer.promise);
  });

  Q.all(filesPromises).then(function(files) {
    res.send({status: 200, files: files});
  });
});

module.exports = router;
