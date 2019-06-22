'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Word = loader.database.define('words', {
  wordId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  wordName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  wordAnswer: {
    type: Sequelize.STRING,
    allowNull: false
  },
  wordGroupId: {
    type: Sequelize.UUID,
    allowNull: false
  },
  createdBy: {
    type: Sequelize.BIGINT,
    allowNull: false
  },
  updatedAt: {
    type: Sequelize.DATE,
    allowNull: false
  }
}, {
  freezeTableName: true,
  timestamps: true,
  indexes: [
    {
      fields: ['createdBy', 'wordGroupId']
    }
  ]
});

module.exports = Word;
