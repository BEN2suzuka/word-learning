const express = require('express');
const router = express.Router();
const Wordgroup = require('../models/wordgroup');
const Favorite = require('../models/favorite');

/* GET home page. */
router.get('/', function(req, res, next) {
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
        favorites: favorites
      });
    });
  } else {
    res.render('index', { user: req.user });
  }
});

module.exports = router;
