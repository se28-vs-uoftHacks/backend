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

// Sends all images in the collection
// Tags each image with isOwned (after retrieving from mongoDB), and
// adds the profileIcon to the image objects for the frontend to use
const getImages = async (req, res) => {
  // Decoding user's username from the token
  const decoded = jwt.decode(
    req.headers["x-access-token"],
    process.env.JWT_SECRET
  )
  if (!decoded) {
    return res.status(401).json({ error: "Unauthorized" })
  }
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

  console.log("")

  try {
    let images = await Image.find()

    // Modify each image
    const modifiedImages = await Promise.all(
      images.map(async (image) => {
        // Add isOwner field
        let newImageObject = { ...image }
        newImageObject.isOwner = image.owner_id.toString() == userId._id.toString()

        // Fetch profileIcon from User model
        const user = await User.findById(image.owner_id).select("profileIcon")
        newImageObject.profileIcon = user ? user.profileIcon : null

        console.log(52, newImageObject)

        return newImageObject
      })
    )

    return res.status(200).send({ images: modifiedImages })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ message: "Service Error" })
  }
}

// Uploads an image to the collection
const uploadImage = async (req, res) => {
  // Decoding user's username from the token
  const decoded = jwt.decode(
    req.headers["x-access-token"],
    process.env.JWT_SECRET
  )
  if (!decoded) {
    return res.status(401).json({ error: "Unauthorized" })
  }
  console.log(decoded)
  //We use the username to find the user id
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
    const imageToUpload = req.file
    const uploadUrl = await uploadToCloudinary(req.file.buffer)

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

// Deletes an image from the collection
// TODO ON THE FRONTEND: Ensure only the owner of the image can delete it.
// (with the isOwned field)
const deleteImage = async (req, res) => {
  console.log("Delete!")

  // Checks if the user is the owner of the image
  const decoded = jwt.decode(
    req.headers["x-access-token"],
    process.env.JWT_SECRET
  )
  if (!decoded) {
    return res.status(401).json({ error: "Unauthorized" })
  }
  const userId = await User.findOne() //We use the username to find the user id
    .where("username")
    .equals(decoded.username)
    .select("_id")
    .exec()

  const { imageId } = req.params

  if (!imageId) {
    return res.status(401).json({ error: "No Item Selected" })
  }
  try {
    // We select the image only if it matches image id and the current user is the owner
    const item = await Image.findOne()
      .where("_id")
      .equals(imageId)
      .where("owner_id")
      .equals(userId._id)
      .exec()

    //Not allowed to delete unless valid image id and user is owner
    if (!item) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    //Destroying the image from cloudinary:
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
    // Removing it from our database.
    await Image.deleteOne({ _id: item._id })
    console.log(`Deleted ${item}`)
    return res.status(200).json({ message: "success" })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: "Service Error" })
  }
}

// Increments the likes of an image by 1
// On the frontend: Disable the like button if the user is the owner of the
// image and only allow users to like an image once
const likeImage = async (req, res) => {
  const decoded = jwt.decode(
    req.headers["x-access-token"],
    process.env.JWT_SECRET
  )
  if (!decoded) {
    return res.status(401).json({ error: "Unauthorized" })
  }
  const userId = await User.findOne() //We use the username to find the user id
    .where("username")
    .equals(decoded.username)
    .select("_id")
    .exec()

  const { imageId } = req.params

  if (!imageId) {
    return res.status(401).json({ error: "No Item Selected" })
  }

  try {
    let Image = await Image.findOne().where("_id").equals(imageId).exec()

    //Ensures there is a found image
    if (!Image) {
      return res.status(404).json({ error: "Image Not Found" })
    }

    //Ensures that users do not like their own images
    if (Image.owner_id.toString() == userId._id.toString()) {
      return res.status(401).json({ error: "Unauthorized Like of Own image" })
    }

    Image["likes"] = Image["likes"] + 1
    //liked_by field has the token of the one who liked it
    Image["liked_by"] = req.headers["x-access-token"]

    //TODO: Also need to increment the score of the current user by 1
    await Image.save()
    res.status(200).send({ message: "success" })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: "Service Error" })
  }
}

module.exports = {
  uploadImage,
  getImages,
  deleteImage,
  likeImage,
}
