const express = require("express");

const AuthController = require("../controllers/auth.controller");

const Router = express.Router();

Router.post("/register", AuthController.registerController);
Router.post("/login", AuthController.loginController);

module.exports = Router;
