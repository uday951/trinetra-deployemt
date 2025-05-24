const mongoose = require('mongoose');
const EducationContentSchema = new mongoose.Schema({
  title: String,
  type: { type: String, enum: ['article', 'video'] },
  url: String,
  description: String,
  tags: [String]
});
module.exports = mongoose.model('EducationContent', EducationContentSchema); 