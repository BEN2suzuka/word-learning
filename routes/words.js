'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const Word = require('../models/word');
const Memory = require('../models/memory');

router.post('/', authenticationEnsurer, (req, res, next) => {
  const updatedAt = new Date();
  Word.create({
    wordName: req.body.wordName.slice(0, 255),
    wordAnswer: req.body.wordAnswer.slice(0, 255),
    wordGroupId: req.body.wordGroupId,  // req.body.wordGroupId に修正
    createdBy: req.user.id,
    updatedAt: updatedAt
  }).then((word) => {
    Memory.create({
      wordId: word.wordId,
      userId: word.createdBy
    });
  }).then(() => {
    res.redirect('/words/wordgroups/' + req.body.wordGroupId);
  });
});

module.exports = router;
