const mongoose = require('mongoose');
const { Schema } = mongoose;

const SummarySchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  summaryText: { type: String, required: true },
  status: { type: String, enum: ['en_attente', 'en_cours', 'termine', 'erreur'], default: 'en_attente' },
  tokensUsed: { type: Number },
  modelUsed: { type: String },
  parameters: { type: Map, of: String },
  suggestedActions: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Summary', SummarySchema);