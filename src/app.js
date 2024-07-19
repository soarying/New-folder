const express = require("express");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const { mySequelize } = require("./models");
const rUser = require("./routes/user");
const rNote = require("./routes/note");
dotenv.config();

const app = express();

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use(limiter);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send({ message: "Welcome to api" });
});

app.use(rUser);
app.use(rNote);

mySequelize
  .sync({ force: false })
  .then(() => console.log("Database synced"))
  .catch((err) => console.error("Error syncing database:", err));

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
