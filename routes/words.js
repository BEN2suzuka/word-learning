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
    res.redirect('/wordgroups/' + req.body.wordGroupId);
  });
});

router.post('/:wordId/users/:userId/delete', authenticationEnsurer, (req, res, next) => {
  const wordId = req.params.wordId;
  let storedWord = null;
  Word.findOne({
    where: { wordId: wordId }
  }).then((word) => {
    storedWord = word;
    if (isMine(req, word)) {
      Memory.findAll({
        where: { wordId: wordId }
      }).then((memories) => {
        const promises = memories.map((m) => { return m.destroy(); });
        return Promise.all(promises);
      }).then(() => {
        return storedWord.destroy();
      }).then(() => {
        console.log('指定された単語を削除しました');  // TODO 除去する
        res.redirect('/wordgroups/' + storedWord.wordGroupId);
      });
    } else {
      const err = new Error('指定された単語が存在しない、または、削除する権限がありません');
      err.status = 404;
      next(err);
    }
  });
});

function isMine(req, word) {
  return word && word.createdBy === req.user.id;
}

module.exports = router;
