const mongoose = require('mongoose');
const { Schema } = mongoose;

const DocumentSchema = new Schema({
  title: { type: String, required: true },
  source: { type: String },
  rawText: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  language: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', DocumentSchema);