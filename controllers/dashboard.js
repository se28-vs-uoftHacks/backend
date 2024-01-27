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

    // I want to sort users by their score in ascending order
    users.sort((a, b) => {
        return a.score - b.score;
    });

    return res.status(200).send({ users })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ message: "Service Error" })
  }
}

module.exports = {
  leaderBoard,
}
