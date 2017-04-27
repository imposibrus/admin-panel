
# NOT FOR PRODUCTION!!!

# Requirements:

- Your app must use own `bodyParser`, `cookieParser`, `session`, `postNormalize`:

        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(cookieParser());
        app.use(session({
          secret: config.get('sessionSecret'),
          resave: true,
          saveUninitialized: false,
          store: sessionStore
        }));
        app.use(postNormalize);
        
    Where `postNormalize` must parse `multipart/form-data` request body and 
    populate `req.body` and `req.files` properties.

- Your app must pass session to `res.locals.session`:

        app.use(function(req, res, next) {
          res.locals.session = req.session;
          next();
        });

- Your app must use Jade view engine:

        app.set('view engine', 'jade');

# Installation:
- Install package: `npm install admin-panel --save`
- Create `admin-config.js` and describe your models.
- Setup:

        var express = require('express'),
            models = require('./models'),
            adminConfig = require('./admin-config.js'),
            adminPanel = require('admin-panel')({
              express: express,
              models: models,
              adminConfig: adminConfig,
              storagePath: path.join(__dirname, '../..', 'public/storage')
            });
        
        router.use('/admin', adminPanel);

    Examples of `models` and `admin-config.js` in `examples/` folder.
