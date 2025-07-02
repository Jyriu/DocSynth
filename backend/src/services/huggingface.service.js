const axios = require('axios');

/**
 * Service de résumé utilisant l'API Hugging Face
 * Modèles recommandés:
 * - facebook/bart-large-cnn (anglais)
 * - csebuetnlp/mT5_multilingual_XLSum (multilingue)
 * - moussaKam/barthez-orangesum-abstract (français)
 */
module.exports = async function summarizeWithHuggingFace(text, model = 'facebook/bart-large-cnn') {
  try {
    const HF_API_KEY = process.env.HUGGING_FACE_API_KEY;
    
    if (!HF_API_KEY) {
      throw new Error('HUGGING_FACE_API_KEY manquante dans les variables d\'environnement');
    }

    // Limiter la taille du texte d'entrée (BART a une limite)
    const maxInputLength = 1024;
    const inputText = text.length > maxInputLength 
      ? text.substring(0, maxInputLength) + '...'
      : text;

    console.log(`📝 Résumé HF: ${inputText.length} caractères → ${model}`);

    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        inputs: inputText,
        parameters: {
          max_length: 150,     // Longueur max du résumé
          min_length: 30,      // Longueur min du résumé
          do_sample: false     // Déterministe
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000  // 60 secondes
      }
    );

    // Hugging Face retourne un array avec summary_text
    const summary = response.data[0]?.summary_text || response.data[0]?.generated_text || '';
    
    if (!summary) {
      throw new Error('Aucun résumé généré par Hugging Face');
    }

    console.log(`✅ Résumé généré: ${summary.length} caractères`);
    return summary.trim();

  } catch (error) {
    console.error('Erreur Hugging Face:', error.response?.data || error.message);
    
    if (error.response?.status === 503) {
      throw new Error('Modèle en cours de chargement, réessayez dans quelques secondes');
    }
    
    if (error.response?.status === 429) {
      throw new Error('Trop de requêtes, ralentissez le rythme');
    }
    
    throw new Error(`Erreur lors de la génération du résumé: ${error.message}`);
  }
}; 