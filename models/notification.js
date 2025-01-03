'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Notification.belongsTo(models.User, {
        foreignKey: "senderId",
        as: "sender",
      });

      Notification.belongsTo(models.User, {
        foreignKey: "receiverId",
        as: 'receiver'
      });
    }
  }
  Notification.init({
    senderId: DataTypes.INTEGER,
    receiverId: DataTypes.INTEGER,
    content: DataTypes.STRING,
    postId: DataTypes.INTEGER,
    type: DataTypes.STRING,
    isRead: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Notification',
  });
  return Notification;
};