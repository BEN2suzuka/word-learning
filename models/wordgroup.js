'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Wordgroup = loader.database.define('wordgroups', {
  wordGroupId: {
    type: Sequelize.UUID,
    primaryKey: true,
    allowNull: false
  },
  wordGroupName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  createdBy: {
    type: Sequelize.BIGINT,
    allowNull: false
  }
}, {
  freezeTableName: true,
  timestamps: false
});

module.exports = Wordgroup;
