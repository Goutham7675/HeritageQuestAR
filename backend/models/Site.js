const mongoose = require('mongoose');
const siteSchema = new mongoose.Schema({
  siteId: { type: String, required: true, unique: true },
  name: String,
  lat: Number,
  lng: Number,
  description: String,
  markerType: String
});
module.exports = mongoose.model('Site', siteSchema);
