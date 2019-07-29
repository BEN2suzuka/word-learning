'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Favorite = loader.database.define('favorites', {
  userId: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    allowNull: false
  },
  wordGroupId: {
    type: Sequelize.UUID,
    primaryKey: true,
    allowNull: false
  },
  favorite: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  freezeTableName: true,
  timestamps: false,
});

module.exports = Favorite;
