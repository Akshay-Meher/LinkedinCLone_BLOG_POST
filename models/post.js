'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Post.belongsTo(models.User, {
        foreignKey: 'userId'
      });

      Post.hasMany(models.Comment, {
        foreignKey: 'postId'
      });

      // Post.belongsToMany(models.Catergory, {
      //   through: "PostCategory",
      //   foreignKey: 'postId'
      // })

      Post.hasMany(models.Like, {
        foreignKey: 'postId'
      });
    }
  }
  Post.init({
    title: DataTypes.STRING,
    content: DataTypes.TEXT,
    imageUrl: DataTypes.STRING,
    // categoryId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    isDeleted: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Post',
  });
  return Post;
};