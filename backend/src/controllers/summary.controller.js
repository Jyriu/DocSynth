const extractText = require('../utils/textExtractor');
const Document = require('../models/Document');
const Summary = require('../models/Summary');
const summarizeWithHuggingFace = require('../services/huggingface.service');

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
      console.log(`📄 Texte extrait: ${rawText.length} caractères`);
      
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

    // Stratégie complète : traiter TOUT le document
    if (rawText.length <= 1000) {
      // Document court : résumé direct avec extraction d'idées clés
      console.log('📝 Document court: résumé direct avec idées clés');
      finalSummary = await summarizeWithHuggingFace(rawText, { 
        promptType: 'key_ideas' 
      });
      
    } else {
      // Document long : découpage complet + résumé consolidé
      console.log('📝 Document long: traitement complet par chunks');
      
      const chunkSize = 1000;
      const chunks = splitTextIntelligent(rawText, chunkSize);
      console.log(`🔧 Document découpé en ${chunks.length} chunks de ~${chunkSize} caractères`);
      
      const keyIdeasFromChunks = [];
      
      // Étape 1: Extraire les idées principales de chaque chunk
      console.log('🔍 Étape 1: Extraction des idées principales de chaque section...');
      
      for (let i = 0; i < chunks.length; i++) {
        try {
          console.log(`🔄 Traitement section ${i+1}/${chunks.length}`);
          
          const chunkSummary = await summarizeWithHuggingFace(chunks[i], { 
            promptType: 'key_ideas'
          });
          
          keyIdeasFromChunks.push({
            section: i + 1,
            ideas: chunkSummary
          });
          
          // Pause pour éviter les rate limits
          if (i < chunks.length - 1) {
            const pauseTime = chunks.length > 10 ? 3000 : 2000;
            console.log(`⏸️ Pause de ${pauseTime/1000}s avant section suivante...`);
            await new Promise(resolve => setTimeout(resolve, pauseTime));
          }
          
        } catch (error) {
          console.warn(`⚠️ Erreur section ${i+1}:`, error.message);
          
          if (error.message.includes('429')) {
            console.log('⏸️ Rate limit atteint, pause de 15 secondes...');
            await new Promise(resolve => setTimeout(resolve, 15000));
            i--; // Retry la même section
            continue;
          }
          
          // Continuer même en cas d'erreur sur une section
        }
      }
      
      if (keyIdeasFromChunks.length === 0) {
        throw new Error('Impossible d\'extraire les idées du document');
      }
      
      console.log(`✅ Idées extraites de ${keyIdeasFromChunks.length} sections`);
      
      // Étape 2: Synthèse finale de toutes les idées principales
      console.log('🎯 Étape 2: Synthèse finale des grandes lignes...');
      
      const allIdeas = keyIdeasFromChunks
        .map(item => `Section ${item.section}: ${item.ideas}`)
        .join('\n\n');
      
      // Traiter la synthèse finale par chunks si nécessaire
      if (allIdeas.length <= 1000) {
        finalSummary = await summarizeWithHuggingFace(allIdeas, { 
          promptType: 'final_synthesis'
        });
      } else {
        // Si les idées combinées sont trop longues, les chunker aussi
        const ideaChunks = splitTextIntelligent(allIdeas, 800);
        const finalIdeas = [];
        
        for (let i = 0; i < ideaChunks.length; i++) {
          try {
            const partialSynthesis = await summarizeWithHuggingFace(ideaChunks[i], { 
              promptType: 'final_synthesis'
            });
            finalIdeas.push(partialSynthesis);
            
            if (i < ideaChunks.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          } catch (error) {
            console.warn(`⚠️ Erreur synthèse ${i+1}:`, error.message);
          }
        }
        
        // Synthèse ultime des synthèses
        const combinedFinalIdeas = finalIdeas.join(' ');
        finalSummary = await summarizeWithHuggingFace(combinedFinalIdeas, { 
          promptType: 'final_synthesis'
        });
      }
    }

    const summary = await Summary.create({
      userId,
      documentId,
      summaryText: finalSummary,
      status: 'termine',
      modelUsed: 'huggingface/bart-large-cnn-complete'
    });

    console.log('✅ Résumé complet généré avec succès');
    console.log(`📊 Résumé final: ${finalSummary.length} caractères`);
    
    res.status(201).json(summary);
  } catch (error) {
    console.error('❌ Erreur génération résumé:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la génération du résumé',
      error: error.message 
    });
  }
};

// GET /summaries/by-user/:userId
exports.getByUser = async (req, res) => {
  try {
    const summaries = await Summary.find({ userId: req.params.userId });
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