
var formidable = require('formidable'),
    mkdirp = require('mkdirp'),
    fs = require('fs'),
    path = require('path'),
    Q = require('q'),
    _ = require('lodash'),
    gm = require('gm');

module.exports = function(req) {
  var form = new formidable.IncomingForm(),
      folder = req.query.folder ? '/' + req.query.folder : '',
      mainDefer = Q.defer(),
      promises = [];

  form.hash = 'md5';

  form.parse(req, function(err, fields, files) {
    if(err) {
      return mainDefer.reject(err);
    }

    _.each(files, function(file, fieldName) {
      var dirPath = path.resolve(__dirname, '../public/storage' + folder),
          ext = file.name.split('.').pop(),
          newFileAbsolutePath,
          newFileUserPath,
          newFileUserPathPreview,
          newFileName = file.hash,
          defer = Q.defer();

      // create uploads dir if not exist
      if(!fs.existsSync(dirPath)) {
        mkdirp.sync(dirPath);
      }

      // absolute path to new file
      newFileAbsolutePath = path.resolve(dirPath, newFileName + '.' + ext);
      // path to file for user
      newFileUserPath = 'http://eco.ft-ru.ru' + '/storage' + folder + '/' + newFileName + '.' + ext;
      newFileUserPathPreview = 'http://eco.ft-ru.ru' + '/storage' + folder + '/' + newFileName + '_preview60x60' + '.' + ext;

      var readStream = fs.createReadStream(file.path),
          writeStream = fs.createWriteStream(newFileAbsolutePath);

      // wait for open readable stream
      readStream.on('open', function() {
        // directly put content to destination
        readStream.pipe(writeStream).on('finish', function() {
          gm(file.path)
            .resize(60)
            .gravity('Center')
            .crop(60, 60, 0, 0)
            .noProfile()
            .write(newFileAbsolutePath.replace(newFileName, newFileName + '_preview60x60'), function(err) {
              fs.unlink(file.path, function(err) {
                if(err) {
                  console.log(err);
                }
              });

              if(err) {
                console.log(err);
                return defer.reject({err: err, desc: 'error on creating preview'});
              }
              defer.resolve({fullSize: newFileUserPath, preview: newFileUserPathPreview, fieldName: fieldName});
            });
        }).on('error', function(err) {
          return defer.reject(err);
        });
      }).on('error', function(err) {
        return defer.reject(err);
      });

      promises.push(defer.promise);
    });

    Q.all(promises).then(function(data) {
      mainDefer.resolve(data);
    }).catch(function(errors) {
      mainDefer.reject(errors);
    });
  });

  return mainDefer.promise;
};


