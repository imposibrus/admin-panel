
var _ = require('lodash'),
    gm = require('gm'),
    Promise = require('bluebird');

var genImagePreviews = function(options) {
  return new Promise(function(resolve, reject) {
    var maxEdge = _.max([options.previewParams.width, options.previewParams.height]);

    gm(options.newFilePath)
        .resize(maxEdge, maxEdge + '^')
        .gravity('Center')
        .crop(options.previewParams.width, options.previewParams.height)
        .noProfile()
        .write(options.previewPath, function(err) {
          if(err) {
            console.log(err);
            return reject(err);
          }

          var previewObject = {};
          previewObject[options.previewParams.width + 'x' + options.previewParams.height] = {
            url: options.previewUrl,
            path: options.previewPath
          };
          resolve(previewObject);
        });
  });
};

module.exports = genImagePreviews;

