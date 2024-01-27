const PORT = process.env.PORT || 8080

const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
require("dotenv").config()
const { configureLibs } = require("./helpers/setup")
const { authRouter } = require("./routes/users")
const { imagesRouter } = require("./routes/images");
// const { dashboardRouter } = require("./routes/images");

configureLibs()
  .then(() => console.log("success configuring libraries!"))
  .catch((e) => console.error(e))
const app = express()

app.use(
  cors({
    allowedHeaders: ["Content-Type", "x-access-token"],
  })
)
//Parse the body as json everytime we receive a request
app.use(bodyParser.json())

//User auth
app.use("/users", authRouter)
app.use("/images", imagesRouter);
// app.use("/dashboard", dashboardRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
