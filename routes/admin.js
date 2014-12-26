
var express = require('express'),
    router = express.Router(),
    adminConfig = require('../admin-config'),
    models = require('../models'),
    _ = require('lodash'),
    formidable = require('formidable'),
    mkdirp = require('mkdirp'),
    fs = require('fs'),
    path = require('path'),
    Q = require('q');


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
        res.render('admin/list', {
            modelConfig: modelConfig,
            adminConfig: adminConfig,
            collection: collection
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
            item = _.extend(item, req.body);
            item.save(function(err) {
                if(err) {
                    return res.send({status: 500, err: err}, 500);
                }
                res.redirect('/admin/list/' + collection);
            });
        });
    }
});

router.post('/upload', function(req, res) {
    var form = new formidable.IncomingForm(),
        folder = req.query.folder ? '/' + req.query.folder : '',
        previews = req.query.previews;

    form.hash = 'md5';

    form.parse(req, function(err, fields, files) {
        var dirPath = path.resolve(__dirname, '../public/storage' + folder),
            ext = files.file.name.split('.').pop(),
            newFileAbsolutePath,
            newFileUserPath,
            newFileName = files.file.hash;

        // create uploads dir if not exist
        if(!fs.existsSync(dirPath)) {
            mkdirp.sync(dirPath);
        }

        // absolute path to new file
        newFileAbsolutePath = path.resolve(dirPath, newFileName + '.' + ext);
        // path to file for user
        newFileUserPath = '/storage'+ folder +'/' + newFileName + '.' + ext;

        var readStream = fs.createReadStream(files.file.path),
            writeStream = fs.createWriteStream(newFileAbsolutePath);

        // wait for open readable stream
        readStream.on('open', function() {
            // directly put content to destination
            readStream.pipe(writeStream).on('finish', function() {
                gm(files.file.path)
                    .resize(60)
                    .gravity('Center')
                    .crop(60, 60, 0, 0)
                    .noProfile()
                    .write(newFileAbsolutePath.replace(newFileName, newFileName + '_preview60x60'), function(err) {
                        fs.unlink(files.file.path, function(err) {
                            if(err) {
                                console.log(err);
                            }
                        });

                        if(err) {
                            console.log(err);
                            return res.send({status: 500, err: err, desc: 'error on creating preview'}, 500);
                        }
                        res.send({status: 200, path: newFileUserPath});
                        //defer.resolve({fullSize: newFileUserPath, preview: newFileUserPathPreview, fieldName: fieldName});
                    });
            }).on('error', function(err) {
                return res.send(err);
            });
        }).on('error', function(err) {
            return res.send(err);
        });

    });
});

module.exports = router;
