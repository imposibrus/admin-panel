
module.exports = function(res, field, document, cb) {
  try {
    require('./' + field.type)(res, field, document, cb);
  } catch(e) {
    res.render('admin/controls/' + field.type, {field: field, document: document}, cb);
  }
};
