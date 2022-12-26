"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      
      User.hasMany(models.Todo, {
        foreignKey: "userId",
      });
      // define association here
    }
  }
  User.init(
    {
      firstName: DataTypes.STRING,
      
      lastName: DataTypes.STRING,
      
      email: DataTypes.STRING,
      
      password: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
