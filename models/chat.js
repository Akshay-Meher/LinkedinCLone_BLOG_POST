'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Chat.belongsTo(models.User, {
        foreignKey: 'userId1',
        // as: 'User1'
      });

      Chat.belongsTo(models.User, {
        foreignKey: 'userId2',
        // as: 'User2'
      });

      Chat.hasMany(models.Message, {
        foreignKey: 'chatId',
        // as: 'Messages'
      });

    }
  }

  Chat.init({
    userId1: DataTypes.INTEGER,
    userId2: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Chat',
  });
  return Chat;
};