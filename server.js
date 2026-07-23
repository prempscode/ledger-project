require("dotenv").config();
const connectDB = require("./src/config/db");

const app = require("./src/app");

connectDB();

app.listen(3000, () => {
  console.log("server running port 3000");
});
