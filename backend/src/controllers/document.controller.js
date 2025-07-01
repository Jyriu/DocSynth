const Document = require('../models/Document');
const Summary = require('../models/Summary');

/**
 * POST /documents
 * Body: { title, rawText, source? }
 */
exports.create = async (req, res) => {
  try {
    const { title, rawText, source } = req.body;
    if (!title || !rawText) {
      return res.status(400).json({ message: 'title and rawText are required' });
    }

    const ownerId = req.user ? req.user.id : null; // may be null if auth not yet enforced

    const doc = await Document.create({ title, rawText, source, ownerId });
    return res.status(201).json(doc);
  } catch (err) {
    console.error('Error creating document:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * GET /documents/:id
 * Returns the document and its summaries
 */
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await Document.findById(id).lean();
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    const summaries = await Summary.find({ documentId: id }).lean();
    return res.json({ ...doc, summaries });
  } catch (err) {
    console.error('Error fetching document:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
