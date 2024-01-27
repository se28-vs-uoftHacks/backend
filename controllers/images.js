const { Request, Response } = require("express")
const User = require("../models/auth_user")
const Image = require("../models/image")
const jwt = require("jsonwebtoken")
const { uploadToCloudinary } = require("../helpers/upload")
const cloudinary = require("cloudinary").v2
/**
 *
 * @param {Request} req
 * @param {Response} res
 * @returns
 */
const uploadImage = async (req, res) => {
  // Decoding user's username from the token
  const decoded = jwt.decode(
    req.headers["x-access-token"],
    process.env.JWT_SECRET
  )
  console.log(decoded)
//   let { details } = req.body
//   console.log(details)
//   details = JSON.parse(details)

  const userId = await User.findOne()
    .where("username")
    .equals(decoded.username)
    .select("_id")
    .exec()
  console.log(userId)
  if (userId == null) {
    return res
      .status(404)
      .send({ message: "Not logged in. Please Login again" })
  }

  try {
    const imageToUpload = req.file.buffer
    //upload image to cloudinary
    const uploadUrl = await uploadToCloudinary(imageToUpload)

    let image = new Image({
      image: uploadUrl,
      owner_id: userId._id,
      likes: 0,
    })
    await image.save()

    res.status(200).send({ message: "success" })
  } catch (err) {
    console.error(err)

    return res.status(500).send({ message: "Service Error" })
  }
}

// Sends all images in the collection
const getImages = async (req, res) => {
  try {
    const images = await Image.find()
    return res.status(200).send({ images })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ message: "Service Error" })
  }
}

// TODO: On the frontend, need to ensure only the owner of the image can delete it.
const deleteImage = async (req, res) => {
  console.log("Delete!")
  const { imageId } = req.params

  if (!imageId) {
    return res.status(401).json({ error: "No Item Selected" })
  }
  try {
    const item = await Image.findOne().where("_id").equals(imageId).exec()

    const publicId = item.image.slice(0, item.image.lastIndexOf("."))

    await cloudinary.uploader.destroy(
      publicId,
      { resource_type: "image", invalidate: true },
      (err, res) => {
        if (err) {
          console.error(err)
          throw err
        }
      }
    )
    await Image.deleteOne({ _id: item._id })
    console.log(`Deleted ${item}`)
    return res.status(200).json({ message: "success" })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: "Service Error" })
  }
}

const likeImage = async (req, res) => {
  const { imageId } = req.params

  let Image = await Image.findOne().where("_id").equals(imageId).exec()

  Image["likes"] = Image["likes"] + 1

  //TODO: Also need to increment the score of the current user by 1

  await Image.save()
  res.status(200).send({ message: "success" })
}

module.exports = {
  uploadImage,
  getImages,
  deleteImage,
  likeImage,
}
