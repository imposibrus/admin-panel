
var path = require('path'),
    _ = require('lodash'),
    getAllInDir = require('./getAllInDir'),
    sortFiles = require('./sortFiles');

module.exports = function getFilesList(options) {
  //var storagePath = path.join(__dirname, 'storage');
  return function getFilesListMiddleware(req, res, next) {
    var folder = _.without(_.compact(req.query.folder.split('/')), 'storage').join('/');

    getAllInDir(path.join(options.storagePath, folder), options.storagePath).done(function(filesStats) {
      var isRoot = folder ? false : true;
      res.send({
        status: 200,
        files: sortFiles(filesStats),
        isRoot: isRoot
      });
    }, function(err) {
      next(err);
    });
  };
};

