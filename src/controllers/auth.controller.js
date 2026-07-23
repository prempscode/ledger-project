const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

// user register : /api/auth/register

async function registerController(req, res) {
  const { email, password, name } = req.body;

  const isExists = await userModel.findOne({ email: email });

  if (isExists) {
    return res.status(422).json({
      message: "User already exists with email",
      status: "faild",
    });
  }
  const user = await userModel.create({
    email,
    password,
    name,
  });
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_TOKEN, {
    expiresIn: "3d",
  });
  res.cookie("token", token);
  res.status(201).json({
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
    },
    token,
  });
}

// user login : /api/auth/login

async function loginController(req, res) {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email }).select("+password");
  if (!user) {
    return res.status(401).json({
      message: "Email or Password is INVALID",
    });
  }

  const isValidPassword = user.comparePassword(password);
  if (!isValidPassword) {
    return res.status(401).json({
      message: "Email or Password is INVALID",
    });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_TOKEN, {
    expiresIn: "3d",
  });
  res.cookie("token", token);

  res.status(200).json({
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
    },
    token,
  });
}

module.exports = { registerController, loginController };
