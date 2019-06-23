const express = require('express');
const router = express.Router();
const Wordgroup = require('../models/wordgroup');

/* GET home page. */
router.get('/', function(req, res, next) {
  const title = '単語帳アプリ'
  if (req.user) {
    Wordgroup.findAll({
      where: {createdBy: req.user.id},
    }).then((wordGroups) => {
      res.render('index', {
        title: title,
        user: req.user,
        wordGroups: wordGroups
      });
    });
  } else {
    res.render('index', { title: title, user: req.user });
  }
});

module.exports = router;
