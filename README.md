# ComplySummarize AI

Application de résumé de documents utilisant l'intelligence artificielle via Hugging Face.

## Fonctionnalités

- ✅ Inscription et connexion des utilisateurs
- ✅ Upload et traitement de fichiers PDF
- ✅ Génération de résumés avec Hugging Face (BART)
- ✅ Interface utilisateur moderne avec Bootstrap
- ✅ Authentification JWT

## Prérequis

1. **Node.js** (version 16 ou plus récente)
2. **MongoDB** (démarré sur le port par défaut 27017)
3. **Clé API Hugging Face** (gratuite sur https://huggingface.co)

## Configuration

### Backend (.env)
Créez un fichier `.env` dans le dossier `backend/` :
```
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/complysummarize
JWT_SECRET=votre_secret_jwt_très_sécurisé_ici_changez_moi
NODE_ENV=development
HUGGING_FACE_API_KEY=votre_clé_hugging_face_ici
```

### Frontend (.env)  
Créez un fichier `.env` dans le dossier `frontend/` :
```
REACT_APP_API_URL=http://localhost:4000
```

## Démarrage

### Option 1: Script automatique (Windows)
```powershell
.\start-dev.ps1
```

### Option 2: Démarrage manuel

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

## Utilisation

1. Ouvrez http://localhost:3000
2. Créez un compte ou connectez-vous
3. Uploadez un fichier PDF
4. Obtenez un résumé généré par IA via Hugging Face

## Architecture

- **Frontend**: React + Bootstrap + Context API
- **Backend**: Express.js + MongoDB + JWT
- **IA**: Hugging Face API avec modèle BART
- **Traitement**: pdf-parse pour l'extraction de texte

## Modèles IA utilisés

- **Principal**: `facebook/bart-large-cnn` (résumé en anglais)
- **Alternatifs**: 
  - `csebuetnlp/mT5_multilingual_XLSum` (multilingue)
  - `moussaKam/barthez-orangesum-abstract` (français)

## Dépannage

- Vérifiez que MongoDB est démarré
- Vérifiez votre clé API Hugging Face
- Les modèles peuvent prendre quelques secondes à démarrer (erreur 503) 