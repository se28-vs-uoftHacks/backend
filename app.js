const PORT = process.env.PORT || 3000

const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
require("dotenv").config();
const { configureLibs } = require("./helpers/setup");

configureLibs().then(()=>console.log("success configuring libraries!")).catch((e) => console.error(e));
const app = express()

app.use(
  cors({
    allowedHeaders: ["Content-Type", "x-access-token"],
  })
)
//Parse the body as json everytime we receive a request
app.use(bodyParser.json())

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
