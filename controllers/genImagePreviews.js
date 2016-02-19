
var _ = require('lodash'),
    gm = require('gm'),
    Promise = require('bluebird');

var genImagePreviews = function(options) {
  return new Promise(function(resolve, reject) {
    var imageObj = gm(options.newFilePath),
        maxWantedEdge = _.max([options.previewParams.width, options.previewParams.height]);

    imageObj.size(function(err, size) {
      if(err) {
        console.error(err.stack);
        return reject(err);
      }

      if(options.previewParams.crop === false || options.previewParams.crop === 'false') {
        // scale only
        var maxImageEdge = _.max([size.width, size.height]);
        if(maxImageEdge > maxWantedEdge) {
          imageObj
              .resize(options.previewParams.width, options.previewParams.height + '>')
              .gravity('Center');
        }
      } else {
        // scale and crop
        imageObj
            .resize(maxWantedEdge, maxWantedEdge + '^')
            .gravity('Center')
            .crop(options.previewParams.width, options.previewParams.height);
      }

      imageObj.noProfile().write(options.previewPath, function(err) {
        if(err) {
          console.error(err.stack);
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
  });
};

module.exports = genImagePreviews;

