const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  data: {
    type: Buffer,
    required: true
  },
  contentType: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  extractedText: String, // Add this line to include extracted text

  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true // Ensure this field is required
  }
});

const Photo = mongoose.model('Photo', photoSchema);

module.exports = Photo;
