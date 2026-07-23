const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: [true, "Email already Exists!"],
      required: [true, "Email is required for creating user !"],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid Email Address"],
    },
    name: {
      type: String,
      required: [true, "Name is required "],
    },
    password: {
      type: String,
      required: [true, "Password is required for creating an account"],
      minlength: [6, "password should contain more than 6 characters."],
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

const saltRounds = 10;

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const hash = await bcrypt.hash(this.password, saltRounds);

  this.password = hash;
  return;
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
