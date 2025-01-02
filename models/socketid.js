'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SocketId extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  SocketId.init({
    userId: DataTypes.INTEGER,
    socketId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'SocketId',
  });
  return SocketId;
};