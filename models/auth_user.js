const mongoose = require("mongoose")
//generate profile picture down the line

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: [true, "Username already taken"],
  },
  password: { type: String },
  score: { type: Number, default: 0 },
  profileIcon: { type: Number, default: 1 }, //goes from 1 to 25 (number of sprites we have)
})

const User = mongoose.model("User", userSchema)

module.exports = User
