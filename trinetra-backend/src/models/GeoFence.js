const mongoose = require('mongoose');
const GeoFenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deviceId: String,
  center: { lat: Number, lng: Number },
  radius: Number,
  active: Boolean
});
module.exports = mongoose.model('GeoFence', GeoFenceSchema); 