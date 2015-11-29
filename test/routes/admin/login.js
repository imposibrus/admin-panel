
var server = require('../../../bin/www'),
    request = require('supertest'),
    models = require('../../../models');

describe('Auth as admin', function() {
  var agent = request.agent(server);

  before(function(done) {
    new models.Admin({login: 'qwe', email: 'qwe@asd.ru', password: '123'}).save(function(err) {
      if(err) {
        throw err;
      }

      done();
    });
  });
  after(function(done) {
    models.Admin.findOne({login: 'qwe', email: 'qwe@asd.ru'}).remove(function(err) {
      if(err) {
        throw err;
      }

      done();
    });
  });
  it('should GET /admin', function(done) {
    agent.get('/admin')
        .expect('Location', '/admin/login')
        .expect(302)
        .end(done);
  });

  it('should GET /admin/login', function(done) {
    agent.get('/admin/login')
        .expect('Content-type', /text\/html/)
        .expect(200)
        .expect(/Admin\-panel/)
        .end(done);
  });

  it('should POST /admin/login and auth', function(done) {
    agent.post('/admin/login')
        .send({login: 'qwe', pass: '123'})
        .expect('Location', '/admin')
        .expect(302)
        .end(done);
  });

  it('should GET /admin', function(done) {
    agent.get('/admin')
        .expect('Content-type', /text\/html/)
        .expect(/\/admin\/list/)
        .expect(200)
        .end(done);
  });

  it('should GET /admin/logout', function(done) {
    agent.get('/admin/logout')
        .expect('Location', '/')
        .expect(302)
        .end(done);
  });
});
