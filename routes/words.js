'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const Word = require('../models/word');
const Wordgroup = require('../models/wordgroup');
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
  let storedWord = null;
  Word.findOne({
    where: { wordId: req.params.wordId }
  }).then((word) => {
    storedWord = word;
    if (isMine(req, word)) {
      Memory.findOne({
        where: { userId: req.user.id, wordId: storedWord.wordId }
      }).then((memory) => {
        memory.destroy().then(() => {
          storedWord.destroy().then(() => {
            Wordgroup.findAll({
              where: { createdBy: req.user.id },
            }).then((wordGroups) => {
              res.render('index', {
                title: '単語帳アプリ',
                user: req.user,
                wordGroups: wordGroups
              });
            });
          });
        });
      });
    } else {
      const err = new Error('指定された単語がない、または、削除する権限がありません');
      err.status = 404;
      next(err);
    }
  })
})

function isMine(req, word) {
  return word && word.createdBy === req.user.id;
}



module.exports = router;
