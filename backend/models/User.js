const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  name: String,
  collectedTokens: [Number]
});
module.exports = mongoose.model('User', userSchema);
