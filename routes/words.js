'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const Word = require('../models/word');
const Memory = require('../models/memory');

router.post('/new', authenticationEnsurer, (req, res, next) => {
  const updatedAt = new Date();
  Word.create({
    wordGroupId: req.body.wordGroupId,
    wordName: req.body.wordName.slice(0, 255),
    wordAnswer: req.body.wordAnswer.slice(0, 255),
    createdBy: req.user.id,
    updatedAt: updatedAt
  }).then((word) => {
    Memory.create({
      userId: req.user.id,
      wordId: word.wordId,
      wordGroupId: req.body.wordGroupId
    });
  }).then(() => {
    res.redirect('/words/wordgroups/' + req.body.wordGroupId);
  });
});

module.exports = router;
