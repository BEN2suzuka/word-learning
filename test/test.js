'use strict';
const request = require('supertest');
const app = require('../app');
const passportStub = require('passport-stub');

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
    passportStub.login({ displayName: 'testuser' });
  });

  after(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });

  it('ログイン時はユーザー名が表示される', (done) => {
    request(app)
      .get('/')
      .expect(/testuser/)
      .expect(200, done);
  });

});