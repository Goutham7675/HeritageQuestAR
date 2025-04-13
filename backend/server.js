// server.js
require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

const apiRouter = require("./routes/api")

const app = express()
app.use(cors())
app.use(express.json())

app.get("/health", (req, res) => res.json({ status: "OK" }))

mongoose.set("strictQuery", false)
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB error:", err.message))

app.use("/api", apiRouter)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Listening on ${PORT}`))
