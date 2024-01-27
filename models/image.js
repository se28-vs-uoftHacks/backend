const mongoose = require("mongoose")

const imageSchema = new mongoose.Schema({
  owner_id: { type: String },
  likes: { type: Number, default: 0 },
  liked_by: { type: Array, default: [] },
  image: { type: String },
})

const Image = mongoose.model("Image", imageSchema)

module.exports = Image
