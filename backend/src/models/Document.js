const mongoose = require('mongoose');
const { Schema } = mongoose;

const DocumentSchema = new Schema({
  title: { type: String, required: true },
  filename: { type: String, required: true }, // name of the uploaded file
  filepath: { type: String, required: true }, // path to where it's stored
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', DocumentSchema);
