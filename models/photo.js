const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  name: String,
  data: Buffer,
  contentType: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  metadata: Object,
  extractedText: String,
  qrCodeData: String, // Add this field
  barcodeData: String, // Barcode data field

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Photo', photoSchema);
