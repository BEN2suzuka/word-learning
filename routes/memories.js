'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const Memory = require('../models/memory');

router.post('/:wordGroupId/words/:wordId/users/:userId', authenticationEnsurer, (req, res, next) => {
  const wordGroupId = req.params.wordGroupId;
  const wordId = req.params.wordId;
  const userId = req.params.userId;
  let memory = req.body.memory;
  memory = memory ? parseInt(memory) : 0;
  Memory.upsert({
    userId: userId,
    wordId: wordId,
    wordGroupId: wordGroupId,
    memory: memory
  }).then(() => {
    res.json({ status: 'OK', memory: memory });
  });
});

module.exports = router;