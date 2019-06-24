'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const User = require('../models/user');
const Word = require('../models/word');
const Wordgroup = require('../models/wordgroup');
const uuidv4 = require('uuid/v4');

router.post('/wordgroups/firstgroup', authenticationEnsurer, (req, res, next) => {
  Wordgroup.create({
    wordGroupId: uuidv4(),
    wordGroupName: '未分類',
    createdBy: req.user.id
  }).then((wordGroup) => {
    res.redirect('/words/wordgroups/' + wordGroup.wordGroupId);
  });
});

router.get('/wordgroups/:wordGroupId', authenticationEnsurer, (req, res, next) => {
  let storedWordGroup = null;
  Wordgroup.findOne({
    include: [{
      model: User,
      attributes: ['userId', 'username']
    }],
    where: { wordGroupId: req.params.wordGroupId }
  }).then((wordGroup) => {
    if (wordGroup) {
      storedWordGroup = wordGroup;
      return Word.findAll({
        where: { wordGroupId: req.params.wordGroupId },
        order: [['"updatedAt"', 'DESC']]
      });
    } else {
      const err = new Error('指定された単語グループは見つかりません');
      err.status = 404;
      next(err);
    }
  }).then((words) => {
    res.render('wordgroup', {
      wordGroup: storedWordGroup,
      words: words
    });
  });
});

module.exports = router;