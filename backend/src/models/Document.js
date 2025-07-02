const mongoose = require('mongoose');
const { Schema } = mongoose;

const DocumentSchema = new Schema({
  title: { type: String, required: true },
  rawText: { type: String, required: true }, // texte extrait du document
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  source: { type: String, default: 'upload' }, // 'upload', 'url', etc.
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', DocumentSchema);
