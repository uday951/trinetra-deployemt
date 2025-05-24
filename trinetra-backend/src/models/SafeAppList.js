const mongoose = require('mongoose');
const SafeAppListSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deviceId: String,
  allowedApps: [String]
});
module.exports = mongoose.model('SafeAppList', SafeAppListSchema); 