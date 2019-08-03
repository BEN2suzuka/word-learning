const express = require('express');
const router = express.Router();
const Wordgroup = require('../models/wordgroup');
const Favorite = require('../models/favorite');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

/* GET home page. */
router.get('/', csrfProtection, (req, res, next) => {
  let storedWordGroups = null;
  if (req.user) {
    Wordgroup.findAll({
      where: {createdBy: req.user.id}
    }).then((wordGroups) => {
      storedWordGroups = wordGroups;
      return Favorite.findAll({
        include: [{
          model: Wordgroup,
          attributes: ['wordGroupId', 'wordGroupName']
        }],
        where: {userId: req.user.id, favorite: 1 }
      });
    }).then((favorites) => {
      res.render('index', {
        user: req.user,
        wordGroups: storedWordGroups,
        favorites: favorites,
        csrfToken: req.csrfToken()
      });
    });
  } else {
    const from = req.query.from;
    if (from) {
      res.cookie('loginFrom', from, { expires: new Date(Date.now() + 600000) });
    }
    res.render('index', { user: req.user });
  }
});

module.exports = router;
