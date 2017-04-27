
var crypto = require('crypto'),
    _ = require('lodash'),
    logger = require('../lib/logger').getLogger('lib/loginCallback');

module.exports = function(options) {
    return function(req, res, next) {
        var login = req.body.login,
            pass = req.body.pass;

        options.models.Admin.findOne({login: login}).exec(function(err, foundAdmin) {
            if (err) {
                return next(err);
            }

            if (_.isEmpty(foundAdmin)) {
                if (!req.session.messages || !_.isArray(req.session.messages)) {
                    req.session.messages = [];
                }

                logger.debug('User with provided login not found.');
                req.session.messages.push({type: 'danger', message: 'User with provided login not found.'});

                return res.redirect('/admin/login');
            }

            if (foundAdmin.password !== crypto.createHash('sha1').update(pass).digest('hex')) {
                if (!req.session.messages || !_.isArray(req.session.messages)) {
                    req.session.messages = [];
                }

                logger.debug('Password mismatch.');
                req.session.messages.push({type: 'danger', message: 'Password mismatch.'});

                return res.redirect('/admin/login');
            }

            req.session.auth = true;
            res.redirect('/admin');
        });
    }
};

