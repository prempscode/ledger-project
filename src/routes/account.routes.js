const express = require("express")
const middleware = require("../middleware/auth.middleware");
const accountController = require("../controllers/account.controller");

const router = express.Router();

router.post("/", middleware.authMiddleware, accountController.createAccount)

module.exports = router;
