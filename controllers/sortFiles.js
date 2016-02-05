
/**
 * Sort files - dirs first, files last, by alphabet.
 * @param {Array} files
 * @returns {Array}
 */
var sortFiles = function(files) {
  return files.sort(function(a, b) {
    if(a.type == b.type) {
      return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
    } else {
      if(a.type == 'dir' && b.type == 'file') {
        return -1;
      } else if(a.type == 'file' && b.type == 'dir') {
        return 1;
      } else {
        return a.name > b.name ? 1 : -1;
      }
    }
  });
};

module.exports = sortFiles;
