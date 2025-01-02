'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // User has one Adreess
      // User.hasOne(models.Address, {
      //   foreignKey: 'userId',
      // });


      // user can have many posts one to many

      User.hasOne(models.FirebaseToken, {
        foreignKey: 'userId'
      });

      User.hasMany(models.Post, {
        foreignKey: 'userId'
      });



      User.hasMany(models.Experience, {
        foreignKey: "userId"
      });

      User.hasMany(models.Comment, {
        foreignKey: 'userId'
      });


      User.hasMany(models.Connection, {
        foreignKey: 'userId'
      });

      User.hasMany(models.Chat, {
        foreignKey: 'userId1',
        // as: 'Chats1'
      });

      User.hasMany(models.Chat, {
        foreignKey: 'userId2',
        // as: 'Chats2'
      });

      User.hasMany(models.Message, {
        foreignKey: 'senderId',
        // as: 'Messages'
      });

      User.hasMany(models.Message, {
        foreignKey: 'receiverId'
      });

      User.hasMany(models.Notification, {
        foreignKey: "senderId",
        as: "sender",
      });

      User.hasMany(models.Notification, {
        foreignKey: "receiverId",
        as: "receiver"
      });

      User.hasMany(models.Like, {
        foreignKey: 'userId'
      });

    }
  }
  User.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    googleId: DataTypes.STRING,
    resetToken: DataTypes.STRING,
    resetTokenExpires: DataTypes.DATE,
    profileImage: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};