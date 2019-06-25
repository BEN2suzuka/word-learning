'use strict';
const request = require('supertest');
const app = require('../app');
const passportStub = require('passport-stub');
const User = require('../models/user');
const Wordgroup = require('../models/wordgroup');

describe('/', () => {
  it('ログインのためのリンクが含まれる', (done) => {
    request(app)
      .get('/')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(/<a href="\/login"/)
      .expect(200, done);
  });
});

describe('/', () => {
  before(() => {
    passportStub.install(app);
    passportStub.login({ username: 'testuser' });
  });

  after(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });

  it('ログイン時はユーザー名が表示される', (done) => {
    User.upsert({ userId: 0, username: 'testuser' }).then(() => {
      request(app)
        .get('/')
        .expect(/testuser/)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          User.findOne({ where: { userId: 0 } }).then((u) => {
            u.destroy().then(() => {
              done();
            });
          });
        });
    });
  });
});

describe('/logout', () => {
  it('/ にリダイレクトされる', (done) => {
    request(app)
      .get('/logout')
      .expect('Location', '/')
      .expect(302, done);
  });
});

describe('/wordgroups', () => {
  before(() => {
    passportStub.install(app);
    passportStub.login({ id: 0, username: 'testuser' });
  });

  after(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });

  it('「未分類」を作成できる', (done) => {
    User.upsert({ userId: 0, username: 'testuser' }).then(() => {
      request(app)
        .post('/wordgroups/firstgroup')
        .expect('Location', '/wordgroups/:wordGroupId')
        .expect(302)
        .end((err, res) => {
          const createdWordGroupPath = res.headers.location;
          request(app)
            .get(createdWordGroupPath)
            .expect(/未分類/)
            .expect(/testuser/)
            .expect(200)
            .end((err, res) => {
              if (err) return done(err);
              const wordGroupId = createdWordGroupPath.split('/wordgroups/')[1];
              Wordgroup.findOne({ where: { wordGroupId: wordGroupId } }).then((w) => {
                w.destroy().then(() => {
                  User.findOne({ where: { userId: 0 } }).then((u) => {
                    u.destroy().then(() => {
                      done();
                    });
                  });
                });
              });
            });
        });
    });
  });

});
