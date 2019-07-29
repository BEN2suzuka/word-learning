'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const User = require('../models/user');
const Word = require('../models/word');
const Wordgroup = require('../models/wordgroup');
const Memory = require('../models/memory');
const Favorite = require('../models/favorite');
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
  let storedMemories = null;
  let favo = null;
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
        });
      }).then((memories) => {
        storedMemories = memories;
        return Favorite.findOne({
          where: { userId: req.user.id, wordGroupId: req.params.wordGroupId }
        });
      }).then((favorite) => {
        const memoryMap = new Map();  // key: wordId, value: memories.memory
        storedMemories.forEach((m) => {
          memoryMap.set(m.wordId, m.memory);
        });
        storedWords.forEach((w) => {
          const a = memoryMap.get(w.wordId) || 0;
          memoryMap.set(w.wordId, a);
        });
        if (favorite === null) {
          favo = Number(0);
        } else {
          favo = Number(favorite.favorite);
        }
        console.log(favo);
        console.log(memoryMap);  // TODO 除去する
        res.render('wordgroup', {
          user: req.user,
          wordGroup: storedWordGroup,
          words: storedWords,
          memories: memoryMap,
          favorite: favo
        });
      });
    } else {
      const err = new Error('指定された単語帳は存在しない、または、すでに削除されています');
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
        return Favorite.findAll({
          where: { wordGroupId: wordGroupId }
        });
      }).then((favorites) => {
        const promises = favorites.map((f) => { return f.destroy(); });
        return Promise.all(promises);
      }).then(() => {
        console.log('指定されたグループおよび関連データを削除しました');  // TODO 除去する
        res.redirect('/');
      });
    } else {
      const err = new Error('指定された単語帳が存在しない、または、削除する権限がありません');
      err.status = 404;
      next(err);
    }
  });
});

router.post('/:wordGroupId/users/:userId/favorite', authenticationEnsurer, (req, res, next) => {
  const wordGroupId = req.params.wordGroupId;
  const userId = req.params.userId;
  let favorite = req.body.favorite;
  favorite = favorite ? parseInt(favorite) : 0;
  Favorite.upsert({
    userId: userId,
    wordGroupId: wordGroupId,
    favorite: favorite
  }).then(() => {
    res.json({ status: 'OK', favorite: favorite });
  });
});

function isMine(req, wordGroup) {
  return wordGroup && wordGroup.createdBy === req.user.id;
}

module.exports = router;
