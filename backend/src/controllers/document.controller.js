const Document = require('../models/Document');
const path = require('path');
const fs = require('fs');

/**
 * POST /documents
 * FormData: title, file (PDF)
 */
exports.create = async (req, res) => {
  try {
    const { title } = req.body;
    const file = req.file;

    if (!title || !file) {
      return res.status(400).json({ message: 'title and file are required' });
    }

    const ownerId = req.user?.id;
    const filepath = file.path;
    const filename = file.originalname;

    const doc = await Document.create({ title, filename, filepath, ownerId });
    res.status(201).json(doc);
  } catch (err) {
    console.error('Error uploading document:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Document.findById(id).lean();
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    const summaries = await Summary.find({ documentId: id }).lean();
    res.json({ ...doc, summaries });
  } catch (err) {
    console.error('Error fetching document:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getMine = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) return res.status(401).json({ message: 'Non autorisé' });

    const documents = await Document.find({ ownerId }).select('-__v').lean();
    res.json(documents);
  } catch (err) {
    console.error('Error fetching user documents:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
