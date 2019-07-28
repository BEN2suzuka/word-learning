'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const User = require('../models/user');
const Word = require('../models/word');
const Wordgroup = require('../models/wordgroup');
const Memory = require('../models/memory');
const uuidv4 = require('uuid/v4');

router.post('/firstgroup', authenticationEnsurer, (req, res, next) => {
  Wordgroup.create({
    wordGroupId: uuidv4(),
    wordGroupName: '未分類',
    createdBy: req.user.id
  }).then((wordGroup) => {
    res.redirect('/wordgroups/' + wordGroup.wordGroupId);
  });
});

router.post('/new', authenticationEnsurer, (req, res, next) => {
  Wordgroup.create({
    wordGroupId: uuidv4(),
    wordGroupName: req.body.wordGroupName,
    createdBy: req.user.id
  }).then((wordGroup) => {
    res.redirect('/wordgroups/' + wordGroup.wordGroupId);
  });
});

router.get('/:wordGroupId', authenticationEnsurer, (req, res, next) => {
  let storedWordGroup = null;
  let storedWords = null;
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
      }).then((words) => {
        storedWords = words;
        return Memory.findAll({
          where: { userId: req.user.id, wordGroupId: req.params.wordGroupId }
        })
      }).then((memories) => {
        const memoryMap = new Map();  // key: wordId, value: memories.memory
        memories.forEach((m) => {
          memoryMap.set(m.wordId, m.memory);
        });
        storedWords.forEach((w) => {
          const a = memoryMap.get(w.wordId) || 0;
          memoryMap.set(w.wordId, a);
        });
        console.log(memoryMap);  // TODO 除去する
        res.render('wordgroup', {
          user: req.user,
          wordGroup: storedWordGroup,
          words: storedWords,
          memories: memoryMap
        });
      });
    } else {
      const err = new Error('指定された単語グループは見つかりません');
      err.status = 404;
      next(err);
    }
  });
});

router.post('/:wordGroupId/delete', authenticationEnsurer, (req, res, next) => {
  const wordGroupId = req.params.wordGroupId;
  let storedWordGroup = null;
  Wordgroup.findById(wordGroupId).then((wordGroup) => {
    storedWordGroup = wordGroup;
    if (isMine(req, wordGroup)) {
      Memory.findAll({
        where: { wordGroupId: wordGroupId }
      }).then((memories) => {
        const promises = memories.map((m) => { return m.destroy(); });
        return Promise.all(promises);
      }).then(() => {
        return Word.findAll({
          where: { wordGroupId: wordGroupId }
        });
      }).then((words) => {
        const promises = words.map((w) => { return w.destroy(); });
        return Promise.all(promises);
      }).then(() => {
        return storedWordGroup.destroy();
      }).then(() => {
        console.log('指定されたグループおよび関連データを削除しました');  // TODO 除去する
        res.redirect('/');
      });
    } else {
      const err = new Error('指定されたグループがない、または、削除する権限がありません');
      err.status = 404;
      next(err);
    }
  });
});

function isMine(req, wordGroup) {
  return wordGroup && wordGroup.createdBy === req.user.id;
}

module.exports = router;
