'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const Wordgroup = require('../models/wordgroup');
const uuidv4 = require('uuid/v4');

router.post('/wordgroups/firstgroup', authenticationEnsurer, (req, res, next) => {
  Wordgroup.create({
    wordGroupId: uuidv4(),
    wordGroupName: '未分類',
    createdBy: req.user.id
  }).then((wordGroup) => {
    console.log('new group created: ' + wordGroup);  // あとで消す？
    res.redirect('/words/wordgroups/' + wordGroup.wordGroupId);
  });
});

router.get('/wordgroups/:wordGroupId', authenticationEnsurer, (req, res, next) => {
  Wordgroup.findAll({
    where: { createdBy: req.user.id }
  }).then((wordGroups) => {
    res.render('wordgroup', {
      title: 'やあ',
      user: req.user,
      wordGroups: wordGroups
    });
  });
});

module.exports = router;