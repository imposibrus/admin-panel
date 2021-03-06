
var path = require('path'),
    express = require('express'),
    router = express.Router(),
    controllers = require('./controllers'),
    viewsFolder = path.resolve(__dirname, 'views');

module.exports = function(options) {
  if(!options.models || !options.adminConfig) {
    throw new Error('Properties `models` and `adminConfig` is required.');
  }

  Object.keys(controllers).forEach(function(key) {
    controllers[key] = controllers[key](options);
  });

  // TODO: custom views

  router.use('/public', express.static(path.resolve(__dirname, 'public')));

  router.get('/logout', function(req, res) {
    req.session.destroy(function() {
      res.redirect('/');
    });
  });

  router.get('/login', function(req, res) {
    if(!req.session || !req.session.auth) {
      return res.render(path.join(viewsFolder, 'admin/login'), {session: req.session});
    }
    res.redirect('/admin');
  });

  router.use('/', function(req, res, next) {
    if(!req.session || !req.session.auth) {
      return res.redirect('/admin/login');
    } else {
      next();
    }
  });

  router.get('/', function(req, res) {
    res.render(path.join(viewsFolder, 'admin/index'), {adminConfig: options.adminConfig});
  });

  router.get('/list/:collection', controllers.listCollection);

  router.post('/sort/:collection', controllers.sortCollectionPost);

  router.get('/sort/:collection', controllers.sortCollectionGet);

  router.get('/edit/:collection/:id', controllers.editCollectionIdGet);

  router.post('/edit/:collection/:id', controllers.editCollectionIdPost);

  router.get('/delete/:collection/:id', controllers.deleteCollectionId);

  router.post('/upload', controllers.upload);

  return router;
};
