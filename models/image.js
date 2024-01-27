const mongoose = require("mongoose")
//generate profile picture down the line

const imageSchema = new mongoose.Schema({
  owner_id: { type: String },
  likes: { type: Number, default: 0 },
  image: { type: String },
})

const Image = mongoose.model("Image", imageSchema)

module.exports = Image
