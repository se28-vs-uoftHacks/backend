const { Request, Response } = require("express")
const User = require("../models/auth_user")
const jwt = require("jsonwebtoken")
/**
 *
 * @param {Request} req
 * @param {Response} res
 * @returns
 */

const leaderBoard = async (req, res) => {
  try {
    const users = await User.find()

    // I want to sort users by their score in descending order
    users.sort((a, b) => {
      return b.score - a.score
    })

    return res.status(200).send({ users })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ message: "Service Error" })
  }
}

const updateProfileIcon = async (req, res) => {
  const { profileIcon } = req.body

  // Ensure that there is a user token
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

  // Update the user's profile icon count
    try {
        await User.findByIdAndUpdate(userId, {
        profileIcon,
        })
        return res.status(200).send({ message: "Profile Icon Updated" })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Service Error" })
    }
}

module.exports = {
  leaderBoard,
  updateProfileIcon,
}
