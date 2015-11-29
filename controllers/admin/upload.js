
var path = require('path'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    genImagePreviews = require('./genImagePreviews'),
    logger = require('../../lib/logger');

module.exports = function(req, res) {
  var uploadFolderPath = path.resolve(__dirname, '..', '..', 'public/storage/' + req.query.folder),
      settings = req.query.settings,
      previews = settings.previews || {};

  if(!fs.existsSync(uploadFolderPath)) {
    mkdirp.sync(uploadFolderPath);
  }

  Promise.resolve(Object.keys(req.files)).map(function(fileName) {
    var file = req.files[fileName];
    return new Promise(function(resolve, reject) {
      var userFolder = '/public/storage/' + req.query.folder,
          newFilename = file.hash + path.extname(file.name),
          newFilePath = path.join(uploadFolderPath, newFilename),

          userUrl = path.join(userFolder, newFilename);

      fs.createReadStream(file.path).pipe(fs.createWriteStream(newFilePath)).on('close', function() {
        fs.unlink(file.path, function (err) {
          if(err) {
            logger.critical('trace', err);
            console.log(err);
          }
        });

        Promise.resolve(Object.keys(previews)).map(function(preview) {
          var previewParams = previews[preview],
              previewName = newFilename.replace(
                file.hash, file.hash + '_preview'+ previewParams.width +'x'+ previewParams.height
              ),
              options = {
                previewUrl: path.join(userFolder, previewName),
                previewPath: path.join(uploadFolderPath, previewName),
                newFilePath: newFilePath,
                previewParams: previewParams
              };

          return genImagePreviews(options);
        }).then(function(previewsObjects) {
          var resp = {};
          resp[settings.originalField] = userUrl;
          if(settings.pathField) {
            resp[settings.pathField] = newFilePath;
          }
          if(!_.isEmpty(previewsObjects)) {
            resp.previews = {};
            previewsObjects.forEach(function(previewParams) {
              resp.previews = _.extend(resp.previews, previewParams);
            });
          }

          resolve(resp);
        }).catch(function(err) {
          logger.critical('trace', err);
          reject(err);
        });
      }).on('error', function(err) {
        logger.critical('trace', err);
        res.status(500).send({status: 500, err: err});
      });
    });
  }, {concurrency: 1}).then(function(files) {
    res.send({status: 200, files: files});
  }).catch(function(err) {
    logger.critical('trace', err);
    res.status(500).send({status: 500, err: err});
  });
};
