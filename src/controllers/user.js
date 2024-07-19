const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { decrypt } = require("../functions/user");

exports.signup = async (req, res) => {
  const { email, password } = req.body;
  try {
    return await User.create({ email, password })
      .then((user) => {
        if (!user) {
          throw new Error("User not created");
        }
        const token = jwt.sign(
          { userId: user.userUUID, email: user.email },
          process.env.JWT_SECRET,
          {
            expiresIn: "1 days",
          }
        );
        return res
          .status(200)
          .json({ token: token, message: "User created successfully" });
      })
      .catch((error) => {
        res.status(400).json({ error: error.message });
      });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    return await User.findOne({
      attributes: ["userUUID", "password", "email"],
      where: { email },
    }).then(async (user) => {
      if (!user) {
        throw new Error("User not found");
      }
      const isPasswordValid =
        password === (await decrypt(user.password)) ? true : false;

      if (!isPasswordValid) {
        throw new Error("Invalid password");
      }

      const token = jwt.sign(
        { userId: user.userUUID, email: user.email },
        process.env.JWT_SECRET,
        {
          expiresIn: "1 days",
        }
      );
      return res
        .status(200)
        .json({ token: token, message: "User logged in successfully" });
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
