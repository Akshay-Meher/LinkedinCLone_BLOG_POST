'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Connection extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Connection.belongsTo(models.User, {
        foreignKey: 'userId'
      });

    }
  }
  Connection.init({
    userId: DataTypes.INTEGER,
    connectedUserId: DataTypes.INTEGER,
    status: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Connection',
  });
  return Connection;
};