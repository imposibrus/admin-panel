
var prompt = require('prompt'),
    optimist = require('optimist'),
    models = require('../models');

prompt.override = optimist.argv;

var schema = {
  properties: {
    email: {
      required: true
    },
    login: {
      required: true
    },
    password: {
      required: true,
      hidden: true
    }
  }
};

prompt.start();

prompt.get(schema, function(err, result) {
  if(err) {
    throw err;
  }

  new models.Admin(result).save(function(err, createdAdmin) {
    if(err) {
      throw err;
    }

    console.log('Created admin with ID', createdAdmin.id);
    models.mongoose.disconnect();
  });
});
