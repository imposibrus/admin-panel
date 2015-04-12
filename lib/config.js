var nconf = require('nconf'),
    path = require('path'),
    packageJson = require('../package.json');

nconf.argv()
    .env()
    .file({ file: path.resolve(__dirname, '../config.json') });

nconf.set('version', packageJson.version);

//if(nconf.get('NODE_ENV') == 'testing') {
//    nconf.set('mongoose:url', 'mongodb://localhost/crm-brainstore_testing');
//}

module.exports = nconf;
