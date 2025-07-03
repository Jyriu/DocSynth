const axios = require('axios');

/**
 * Service de résumé utilisant l'API Hugging Face
 * Modèles recommandés:
 * - facebook/bart-large-cnn (anglais)
 * - csebuetnlp/mT5_multilingual_XLSum (multilingue)
 * - moussaKam/barthez-orangesum-abstract (français)
 */

// Configuration Mistral Pro API
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MODEL_NAME = process.env.MISTRAL_MODEL || 'mistral-small-latest'; // paramétrable via env

// System prompts spécialisés pour chaque tâche
const SYSTEM_PROMPTS = {
  condensation: `Condensez ce texte en gardant toutes les informations importantes : chiffres, dates, noms, détails clés. Supprimez les répétitions et mots inutiles. Réduisez d'environ 40% maximum.

Répondez uniquement avec le texte condensé.`,

  summary: `Vous êtes un assistant IA expert qui doit résumer un document (article, contrat, étude, jugement, rapport, etc.).

Objectif : produire un résumé CLAIR, CONCIS et COHÉRENT en français, adapté à un lecteur professionnel pressé.

Directives :
• Inclure : sujet, idées/arguments principaux, faits ou chiffres essentiels, conclusions ou recommandations majeures, ou même des détails et formats type tableau, liste etc...
• Exclure : JSON
• Pas d'introduction « Voici le résumé » ni de conclusion « En résumé ». Juste du texte résumant le document avec assez de détails pour que le lecteur puisse comprendre le document sans avoir besoin de lire le document en entier.
• Ton neutre et informatif, vocabulaire courant mais précis.`
};

async function summarizeWithMistral(text, options = {}) {
  try {
    if (!MISTRAL_API_KEY) {
      throw new Error('MISTRAL_API_KEY manquante dans les variables d\'environnement');
    }

    const promptType = options.promptType || 'summary';
    const systemPrompt = options.customSystemPrompt || SYSTEM_PROMPTS[promptType] || SYSTEM_PROMPTS.summary;
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🤖 Appel Mistral Pro API...`);
      console.log(`📝 Type: ${promptType}`);
      console.log(`📊 Texte d'entrée: ${text.length} caractères`);
    }
    
    const response = await axios.post(
      MISTRAL_API_URL,
      {
        model: MODEL_NAME,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user", 
            content: text
          }
        ],
        temperature: 0.3, // Factuel et précis
        max_tokens: promptType === 'condensation' ? 800 : 1200,
        top_p: 0.9
      },
      {
        headers: {
          'Authorization': `Bearer ${MISTRAL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 120000 // 2 minutes pour Mistral Pro
      }
    );

    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      const result = response.data.choices[0].message.content.trim();
      if (process.env.NODE_ENV !== 'production') {
        console.log(`✅ Résumé Mistral généré: ${result.length} caractères`);
        // Logs des tokens pour monitoring
        if (response.data.usage) {
          console.log(`📊 Tokens utilisés: ${response.data.usage.total_tokens} (prompt: ${response.data.usage.prompt_tokens}, completion: ${response.data.usage.completion_tokens})`);
        }
      }
      
      return result;
    } else {
      throw new Error('Format de réponse inattendu de l\'API Mistral');
    }

  } catch (error) {
    console.error('❌ Erreur Mistral API:', error.message);
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📄 Data:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 429) {
        throw new Error('429'); // Rate limit
      }
      
      if (error.response.status === 401) {
        throw new Error('Clé API Mistral invalide ou expirée');
      }
      
      if (error.response.status === 402) {
        throw new Error('Quota Mistral dépassé ou paiement requis');
      }
    }
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Timeout de l\'API Mistral');
    }
    
    throw error;
  }
}

module.exports = summarizeWithMistral;