const { DataTypes, UUIDV4 } = require("sequelize");
const { encrypt } = require("../functions/user");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
      },
      userUUID: {
        type: DataTypes.UUID,
        defaultValue: UUIDV4,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: "The email address is already in use.",
        },
        validate: {
          notEmpty: {
            msg: "Email address is required.",
          },
          isEmail: {
            msg: "Must be a valid email address.",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Password is required.",
          },
          len: {
            args: [6, 100],
            msg: "Password must be at least 6 characters long.",
          },
        },
      },
    },
    {
      timestamps: true,
      hooks: {
        beforeCreate: async (user) => {
          user.password = await encrypt(user.password);
        },
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            user.password = await encrypt(user.password);
          }
        },
      },
      defaultScope: {
        attributes: { exclude: ["password", "email", "userId"] },
      },
      tableName: "tbl_users",
      indexes: [
        {
          name: "userIndex",
          fields: ["userId", "userUUID", "password", "email"],
        },
      ],
    }
  );

  return User;
};
