const { leaderBoard, updateProfileIcon } = require("../controllers/dashboard")

const express = require("express")

const dashboardRouter = express.Router()

dashboardRouter.get("/", leaderBoard)
dashboardRouter.put("/profileIcon", updateProfileIcon)

module.exports = {
  dashboardRouter,
}
