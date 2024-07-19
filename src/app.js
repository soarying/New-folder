const express = require("express");
const rateLimiter = require("./middlewares/rateLimiter");
const dotenv = require("dotenv");
const { mySequelize } = require("./models");
const rUser = require("./routes/user");
const rNote = require("./routes/note");
dotenv.config();

const app = express();

app.use(rateLimiter);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(rUser);
app.use(rNote);

mySequelize
  .sync({ force: false })
  .then(() => console.log("Database synced"))
  .catch((err) => console.error("Error syncing database:", err));

app.get("/", (req, res) => {
  res.send({ message: "Welcome to api" });
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
