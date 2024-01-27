const { leaderBoard } = require("../controllers/dashboard")

const express = require("express")

const dashboardRouter = express.Router()

dashboardRouter.get("/", leaderBoard)

module.exports = {
  dashboardRouter,
}
