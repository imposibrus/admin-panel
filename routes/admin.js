
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

router.get('/edit/:collection/:id', function(req, res) {
    var collection = req.params.collection,
        id = req.params.id,
        modelConfig = _.find(adminConfig.collections, {name: collection});

    models[modelConfig.model].findById(id).exec(function(err, item) {
        res.render('admin/edit', {
            modelConfig: modelConfig,
            item: item
        });
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

var formidable = require('formidable'),
    mkdirp = require('mkdirp'),
    fs = require('fs'),
    path = require('path');

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
