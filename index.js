
var _ = require('lodash'),
    humanize = require('humanize'),
    adminRouter = require('./routes'),
    loginCallback = require('./controllers/loginCallback');

module.exports = function(options) {
    var router = options.express.Router();

    options.loginCallback = options.loginCallback || loginCallback(options);

    router.use(function(req, res, next) {
        res.locals._ = _;
        res.locals.humanize = humanize;
        next();
    });

    router.post('/login', options.loginCallback);

    router.use('/', adminRouter(options));

    return router;
};

