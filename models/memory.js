'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Memory = loader.database.define('memories', {
  userId: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    allowNull: false
  },
  wordId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  wordGroupId: {
    type: Sequelize.UUID,
    allowNull: false
  },
  memory: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
}, {
  freezeTableName: true,
  timestamps: false,
});

module.exports = Memory;