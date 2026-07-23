const mongoose = require("mongoose");

async function connectDB() {
  await mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("DB is Connected");
    })
    .catch((err) => {
      console.log("Error connecting to DB",": " , err.message);
      process.exit(1);
    });
}

module.exports = connectDB;