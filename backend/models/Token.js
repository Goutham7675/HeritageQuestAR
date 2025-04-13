const mongoose = require('mongoose');
const tokenSchema = new mongoose.Schema({
  tokenId:       { type: Number, required: true, unique: true },
  siteId:        { type: String, required: true },
  metadataURI:   String,
  owner:         String,
  mintedAt:      { type: Date, default: Date.now },
  forAuction:    { type: Boolean, default: false },
  highestBid:    { type: Number, default: 0 },
  highestBidder: { type: String, default: null },
  auctionEnds:   { type: Date, default: null },
  sold:          { type: Boolean, default: false },
  salePrice:     { type: Number, default: 0 }
});
module.exports = mongoose.model('Token', tokenSchema);
