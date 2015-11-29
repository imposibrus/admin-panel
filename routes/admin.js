
var express = require('express'),
    router = express.Router(),
    adminConfig = require('../admin-config'),
    controllers = require('../controllers'),
    models = require('../models'),
    sha1 = require('sha1'),
    _ = require('lodash');

router.post('/login', function(req, res, next) {
  var login = req.body.login,
      pass = req.body.pass;

  models.Admin.findOne({login: login}).exec(function(err, foundAdmin) {
    if(err) {
      return next(err);
    }

    if(_.isEmpty(foundAdmin)) {
      if(!req.session.messages || !_.isArray(req.session.messages)) {
        req.session.messages = [];
      }
      req.session.messages.push({type: 'danger', message: 'User with provided login not found.'});
      return res.redirect('/admin/login');
    }

    if(foundAdmin.password != sha1(pass)) {
      if(!req.session.messages || !_.isArray(req.session.messages)) {
        req.session.messages = [];
      }
      req.session.messages.push({type: 'danger', message: 'Password mismatch.'});
      return res.redirect('/admin/login');
    }

    req.session.auth = true;
    res.redirect('/admin');
  });
});

router.get('/logout', function(req, res) {
  req.session.destroy(function() {
    res.redirect('/');
  });
});

router.get('/login', function(req, res) {
  if(!req.session || !req.session.auth) {
    return res.render('admin/login', {session: req.session});
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
  res.render('admin/index', {adminConfig: adminConfig});
});

router.get('/list/:collection', controllers.admin.listCollection);

router.post('/sort/:collection', controllers.admin.sortCollectionPost);

router.get('/sort/:collection', controllers.admin.sortCollectionGet);

router.get('/edit/:collection/:id', controllers.admin.editCollectionIdGet);

router.post('/edit/:collection/:id', controllers.admin.editCollectionIdPost);

router.get('/delete/:collection/:id', controllers.admin.deleteCollectionId);

router.post('/upload', controllers.admin.upload);

module.exports = router;
