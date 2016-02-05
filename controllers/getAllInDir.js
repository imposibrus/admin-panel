
var fs = require('fs'),
    path = require('path'),
    Promise = require('bluebird'),
    imageExtensions = ['.png', '.jpg', '.jpeg', '.bmp', '.gif', '.tiff'];

var getPublicPath = function(storagePath, dirPath, fileName) {
  var storagePathArr = storagePath.split('/'),
      pathToPublicFolder = storagePathArr.slice(0, storagePathArr.length - 2).join('/');

  return path.join(dirPath, fileName).replace(pathToPublicFolder, '');
};

/**
 * Scan dir by path and return all files and dirs inside it.
 * @param {String} dirPath
 * @param {String} storagePath
 * @returns {Promise}
 */
var getAllInDir = function(dirPath, storagePath) {
  return new Promise(function(resolve, reject) {
    fs.readdir(dirPath, function(err, fileNames) {
      if(err) {
        return reject(err);
      }

      var out = {
        files: []
      };
      fileNames.forEach(function(fileName) {
        var fileStat = fs.statSync(path.join(dirPath, fileName)),
            fileData = {
              name: fileName,
              path: getPublicPath(storagePath, dirPath, fileName),
              size: fileStat.size
            };

        if(fileStat.isFile()) {
          fileData.type = 'file';
          if(imageExtensions.indexOf(path.extname(fileName).toLowerCase()) != -1) {
            fileData.fileType = 'image';
          }
        } else if(fileStat.isDirectory()) {
          fileData.type = 'dir';
        }
        out.files.push(fileData);
      });

      resolve(out.files);
    });
  });
};

module.exports = getAllInDir;
