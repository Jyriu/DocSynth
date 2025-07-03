const extractText = require('../utils/textExtractor');
const Document = require('../models/Document');
const Summary = require('../models/Summary');
const summarizeWithMistral = require('../services/mistral.service');
const isDev = process.env.NODE_ENV !== 'production';

// POST /summaries/generate (auth)
// Accepts multipart/form-data with either:
//  - file (buffer) to summarise and create document
//  - documentId referencing an existing stored document
// Always stores result in Summary linked to user & document
exports.generate = async (req, res) => {
  try {
    const userId = req.user.id;

    let rawText;
    let documentId = req.body.documentId;

    if (req.file) {
      // Extraire le texte du fichier uploadé (PDF ou texte)
      rawText = await extractText(req.file);
      if (isDev) console.log(`📄 Texte extrait: ${rawText.length} caractères`);
      
      // Créer un document en base pour l'historique
      const doc = await Document.create({
        title: req.file.originalname,
        rawText,
        ownerId: userId,
        source: 'upload'
      });
      documentId = doc._id;
    } else if (documentId) {
      const doc = await Document.findById(documentId);
      if (!doc) return res.status(404).json({ message: 'Document not found' });
      rawText = doc.rawText;
    } else {
      return res.status(400).json({ message: 'Provide a file or documentId' });
    }

    let finalSummary;

    // Fonction utilitaire pour estimer grossièrement les tokens (≈ 4 caractères par token)
    const estimateTokens = (txt) => Math.ceil(txt.length / 4);
    const tokenCount = estimateTokens(rawText);
    const DIRECT_THRESHOLD = 7000; // on garde une marge de sécurité (modèle 8k)

    if (isDev) console.log(`📏 Longueur document: ${rawText.length} caractères ≈ ${tokenCount} tokens`);

    if (tokenCount <= DIRECT_THRESHOLD) {
      // -----------------------------
      // CAS 1: document assez petit ⇒ résumé direct sans condensation
      // -----------------------------
      if (isDev) console.log('🟢 Taille adaptée: résumé direct SANS condensation');
      finalSummary = await summarizeWithMistral(rawText, {
        promptType: 'summary'
      });

    } else {
      // -----------------------------
      // CAS 2: document trop grand ⇒ découpe en BLOCS MAX + résumés directs
      // -----------------------------
      if (isDev) console.log('🟠 Document volumineux: découpe en blocs max + résumés intermédiaires');

      const CHAR_THRESHOLD = DIRECT_THRESHOLD * 4; // ≈ 28 000 caractères
      const blocks = splitTextIntelligent(rawText, CHAR_THRESHOLD);
      if (isDev) console.log(`🔧 Document découpé en ${blocks.length} blocs de ~${CHAR_THRESHOLD} caractères`);

      const blockSummaries = [];
      for (let i = 0; i < blocks.length; i++) {
        try {
          if (isDev) console.log(`📑 Résumé bloc ${i + 1}/${blocks.length}`);
          const blockSummary = await summarizeWithMistral(blocks[i], {
            promptType: 'summary'
          });
          blockSummaries.push(blockSummary);
          if (i < blocks.length - 1) {
            await new Promise(r => setTimeout(r, 2000));
          }
        } catch (err) {
          console.warn(`⚠️ Erreur résumé bloc ${i + 1}:`, err.message);
          if (err.message.includes('429')) {
            if (isDev) console.log('⏸️ Pause 30s pour rate limit...');
            await new Promise(r => setTimeout(r, 30000));
            i--; // retry bloc
            continue;
          }
          blockSummaries.push(blocks[i].slice(0, 1000)); // fallback brut
        }
      }

      const combinedSummaryInput = blockSummaries.join('\n\n');

      if (blockSummaries.length === 1) {
        // Un seul bloc => déjà le résumé final
        finalSummary = blockSummaries[0];
      } else {
        if (isDev) console.log('🎯 Résumé final des résumés de blocs...');
        finalSummary = await summarizeWithMistral(combinedSummaryInput, {
          promptType: 'summary'
        });
      }
    }

    const summary = await Summary.create({
      userId,
      documentId,
      summaryText: finalSummary,
      status: 'termine',
      modelUsed: 'mistral-large-latest'
    });

    if (isDev) {
      console.log('✅ Résumé Mistral Pro généré avec succès');
      console.log(`📊 Résumé final: ${finalSummary.length} caractères`);
    }

    res.status(201).json(summary);
  } catch (error) {
    console.error('❌ Erreur génération résumé Mistral:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la génération du résumé avec Mistral',
      error: error.message 
    });
  }
};

// GET /summaries/by-user/:userId
exports.getByUser = async (req, res) => {
  try {
    const summaries = await Summary.find({ userId: req.params.userId })
      .populate('documentId', 'title createdAt')
      .sort({ createdAt: -1 });
    res.json(summaries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /summaries/:id
exports.getOne = async (req, res) => {
  try {
    const summary = await Summary.findById(req.params.id);
    if (!summary) return res.status(404).json({ message: 'Summary not found' });
    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /summaries/history/me (auth)
exports.historyMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const summaries = await Summary.find({ userId })
      .populate('documentId', 'title createdAt')
      .sort({ createdAt: -1 });
    res.json(summaries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Helper intelligent : découpe en respectant les phrases
function splitTextIntelligent(text, maxLength) {
  const result = [];
  let start = 0;
  
  while (start < text.length) {
    let end = start + maxLength;
    
    // Si on n'est pas à la fin du texte, essayer de couper à la fin d'une phrase
    if (end < text.length) {
      // Chercher le dernier point dans les 100 derniers caractères
      const searchZone = text.slice(Math.max(start, end - 100), end);
      const lastDot = searchZone.lastIndexOf('. ');
      const lastExcl = searchZone.lastIndexOf('! ');
      const lastQuest = searchZone.lastIndexOf('? ');
      
      const lastSentenceEnd = Math.max(lastDot, lastExcl, lastQuest);
      
      if (lastSentenceEnd > 0) {
        // Ajuster pour couper après la phrase
        end = Math.max(start, end - 100) + lastSentenceEnd + 2;
      }
    }
    
    result.push(text.slice(start, end).trim());
    start = end;
  }
  
  return result.filter(chunk => chunk.length > 0);
}