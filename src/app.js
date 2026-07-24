const express = require("express");
const authRouter = require("./routes/auth.routes");
const cookieParser = require("cookie-parser");
const dns = require("dns");
const accountRouter = require("./routes/account.routes");

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();

app.use(express.json());
app.use(cookieParser());

/**
 * Auth routes prefix
 */
app.use("/api/auth", authRouter);
/**
 * Account routes prefix
 */
app.use("/api/accounts", accountRouter)
module.exports = app;
