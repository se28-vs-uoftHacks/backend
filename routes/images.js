const {
  getImages,
  uploadImage,
  deleteImage,
  likeImage,
} = require("../controllers/images")

const express = require("express")

const imagesRouter = express.Router()

// Need to pass user token in x-access-token
imagesRouter.get("/", getImages)
imagesRouter.delete("/:imageId", deleteImage)
imagesRouter.post("/upload", uploadImage)
imagesRouter.put("/like/:imageId", likeImage)
module.exports = {
  imagesRouter,
}
