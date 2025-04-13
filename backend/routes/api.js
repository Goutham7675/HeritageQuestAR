const express = require("express")
const router = express.Router()
const User = require("../models/User")
const Site = require("../models/Site")
const Token = require("../models/Token")

// GET sites (seed your DB manually or via script)
router.get("/sites", async (req, res) => {
  res.json(await Site.find())
})

// Simulate mint
router.post("/simulate-mint", async (req, res) => {
  const { siteId, metadataURI, owner } = req.body
  const last = await Token.findOne().sort({ tokenId: -1 })
  const nextId = last ? last.tokenId + 1 : 1
  const token = new Token({ tokenId: nextId, siteId, metadataURI, owner })
  await token.save()
  let user = await User.findOne({ walletAddress: owner })
  if (!user) {
    user = await User.create({ walletAddress: owner, collectedTokens: [] })
  }
  user.collectedTokens.push(nextId)
  await user.save()
  res.status(201).json({ token })
})

router.get("/tokens", async (req, res) => res.json(await Token.find()))

router.post("/tokens/:tokenId/auction", async (req, res) => {
  const { tokenId } = req.params
  const { durationMinutes } = req.body
  const token = await Token.findOne({ tokenId })
  if (!token) {
    return res.status(404).json({ error: "Token not found" })
  }
  if (token.forAuction) {
    return res.status(400).json({ error: "Already in auction" })
  }
  token.forAuction = true
  token.auctionEnds = new Date(Date.now() + durationMinutes * 60000)
  await token.save()
  res.json({ token })
})

router.post("/tokens/:tokenId/bid", async (req, res) => {
  const { tokenId } = req.params
  const { bidder, amount } = req.body
  const token = await Token.findOne({ tokenId })
  if (!token) {
    return res.status(404).json({ error: "Token not found" })
  }
  if (!token.forAuction) {
    return res.status(400).json({ error: "Not in auction" })
  }
  if (new Date() > token.auctionEnds) {
    return res.status(400).json({ error: "Auction ended" })
  }
  if (amount <= token.highestBid) {
    return res.status(400).json({ error: "Bid too low" })
  }
  token.highestBid = amount
  token.highestBidder = bidder
  await token.save()
  res.json({ token })
})

router.post("/tokens/:tokenId/close-auction", async (req, res) => {
  const { tokenId } = req.params
  const token = await Token.findOne({ tokenId })
  if (!token) {
    return res.status(404).json({ error: "Token not found" })
  }
  if (!token.forAuction) {
    return res.status(400).json({ error: "Not in auction" })
  }
  if (new Date() < token.auctionEnds) {
    return res.status(400).json({ error: "Auction still running" })
  }
  token.forAuction = false
  token.sold = !!token.highestBidder
  token.salePrice = token.highestBidder ? token.highestBid : 0
  if (token.sold) {
    token.owner = token.highestBidder
  }
  await token.save()
  res.json({ token })
})

// routes/api.js (new endpoints added below the existing routes)

// GET user info by wallet address
router.get("/user/:walletAddress", async (req, res) => {
  const user = await User.findOne({ walletAddress: req.params.walletAddress })
  if (!user) {
    return res.status(404).json({ error: "User not found" })
  }
  res.json(user)
})

// GET tokens currently in auction for marketplace listings
router.get("/tokens/marketplace", async (req, res) => {
  const tokensForAuction = await Token.find({ forAuction: true })
  res.json(tokensForAuction)
})

module.exports = router
