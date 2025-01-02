'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Message.belongsTo(models.Chat, {
        foreignKey: 'chatId'
      });

      Message.belongsTo(models.User, {
        foreignKey: 'senderId'
      });

      Message.belongsTo(models.User, {
        foreignKey: 'receiverId'
      });

    }
  }
  Message.init({
    chatId: DataTypes.INTEGER,
    senderId: DataTypes.INTEGER,
    content: DataTypes.TEXT,
    type: DataTypes.STRING,
    isRead: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Message',
  });
  return Message;
};