const { DataTypes, UUIDV4 } = require("sequelize");

module.exports = (sequelize) => {
  const Note = sequelize.define(
    "Note",
    {
      noteId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
      },
      noteUUID: {
        type: DataTypes.UUID,
        defaultValue: UUIDV4,
        allowNull: false,
        unique: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: "tbl_notes",
      defaultScope: {
        attributes: { exclude: ["noteId"] },
      },
      indexes: [
        {
          name: "noteIndex",
          fields: ["noteId", "noteUUID", "title"],
        },
      ],
    }
  );

  return Note;
};
