const dotenv = require("dotenv");
const { Sequelize } = require("sequelize");

dotenv.config();

const mySequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: process.env.DB_PORT,
    logging: console.log,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const User = require("./user")(mySequelize);
const Note = require("./note")(mySequelize);
const User_Note = require("./user_note")(mySequelize);

User.belongsToMany(Note, {
  through: User_Note,
  foreignKey: "userId",
});
Note.belongsToMany(User, {
  through: User_Note,
  foreignKey: "noteId",
});

module.exports = {
  mySequelize,
  User,
  Note,
  User_Note,
};
