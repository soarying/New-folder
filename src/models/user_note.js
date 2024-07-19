const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const User_Note = sequelize.define(
    "User_Note",
    {
      isOwner: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "tbl_users_notes",
      indexes: [
        {
          name: "users_notesIndex",
          fields: ["isOwner"],
        },
      ],
    }
  );

  return User_Note;
};
