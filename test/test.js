'use strict';
const request = require('supertest');
const assert = require('assert');
const app = require('../app');
const passportStub = require('passport-stub');
const User = require('../models/user');
const Wordgroup = require('../models/wordgroup');
const Word = require('../models/word');
const Memory = require('../models/memory');
const Favorite = require('../models/favorite');

describe('/', () => {

  it('ログインのためのリンクが含まれる', (done) => {
    request(app)
      .get('/')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(/<a.*href="\/login"/)
      .expect(200, done);
  });

});


describe('/', () => {

  before(() => {
    passportStub.install(app);
    passportStub.login({ userId: 123456789, username: 'testuser' });
  });

  after(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });

  it('ログイン時はユーザー名が表示される', () => {
    console.log('いまここ１');
    return User.upsert({ userId: 123456789, username: 'testuser' })
    .then(() => {
      console.log('いまここ２');
      return delay(2000);    // ここで2秒足止めして、データベースのスタンバイ待ち
    })
    .then(() => {
      console.log('いまここ３');
      return request(app)
        .get('/')
        .expect(/testuser をログアウト/)
        .expect(200);
    });
  });

});


function delay(timeoutMs) {
  console.log('delay開始');
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('delay完了');
      resolve(timeoutMs);
    }, timeoutMs);
  });
}
