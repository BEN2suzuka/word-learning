'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Memory = loader.database.define('memories', {
  wordId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  userId: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    allowNull: false
  },
  memory: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  freezeTableName: true,
  timestamps: false
});

module.exports = Memory;