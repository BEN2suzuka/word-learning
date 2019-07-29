const express = require('express');
const router = express.Router();
const Wordgroup = require('../models/wordgroup');

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.user) {
    Wordgroup.findAll({
      where: {createdBy: req.user.id},
    }).then((wordGroups) => {
      if (wordGroups) {
      res.render('index', {
        user: req.user,
        wordGroups: wordGroups
      });
    } else {
      res.render('index', { user: req.user });
    }
    });
  } else {
    res.render('index', { user: req.user });
  }
});

module.exports = router;
