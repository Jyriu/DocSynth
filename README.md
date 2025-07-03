# ComplySummarize AI

Application full-stack (React + Express/Mongo) permettant :

1. l'upload de documents PDF ;
2. l'extraction du texte ;
3. la génération de résumés IA via l'API Mistral ;
4. la consultation de l'historique de ses résumés ;
5. le téléchargement du résumé au format PDF.

## Fonctionnalités principales

- ✅ Inscription / connexion (JWT)
- ✅ Upload de fichiers PDF
- ✅ Résumé IA automatique (Mistral 7B)
- ✅ Historique utilisateur (documents + résumés)
- ✅ Export PDF du résumé (jsPDF)
- ✅ Interface moderne Bootstrap 5

## Prérequis

1. **Node.js** ≥ 18
2. **MongoDB** (local ou distant)
3. **Clé API Mistral** ➜ https://console.mistral.ai/

## Configuration

### Backend (`backend/.env`)
```
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/complysummarize
JWT_SECRET=change_me
# Clé et modèle Mistral
MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxx
MISTRAL_MODEL=mistral-small-latest        # optionnel (défaut)
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```
REACT_APP_API_URL=http://localhost:4000
```

## Lancer l'application

### Script Windows
```powershell
./start-dev.ps1    # démarre backend + frontend
```

### Manuel
```bash
# Terminal 1 – Backend
yarn install && yarn dev   # ou npm

# Terminal 2 – Frontend
cd frontend
yarn install && yarn start
```

Accédez ensuite à http://localhost:3000.

## Architecture

| Couche | Techno | Détails |
|--------|--------|---------|
| Frontend | React 19, React-Router 6, Bootstrap 5 | AuthContext + pages Home, Login, Register, History |
| Backend | Express 4, MongoDB, JWT | Routes : `/auth`, `/summaries`, `/documents` |
| IA | Mistral API (`chat/completions`) | Adaptation du prompt + découpe intelligente des textes volumineux |

### Flux de résumé
1. PDF envoyé (`/summaries/generate`, JWT obligatoire).
2. Texte extrait via `pdf-parse`.
3. Calcul de la taille : 
   - si ≤ 7 000 tokens → résumé direct ;
   - sinon → découpe en blocs + résumé final.
4. Résumé stocké (`Summary`), lié au `Document` et à l'utilisateur.
5. Le frontend récupère `/summaries/history/me` pour lister l'historique.

## Mise à jour 2025-07

- Passage de Hugging Face → Mistral API (plus stable, meilleur français).
- Ajout de la page Historique + export PDF.
- Nettoyage des secrets hard-codés.
- Journalisation restreinte à `NODE_ENV !== 'production'.`

## Dépannage

- **MongoDB** : service lancé ? port correct ?
- **Mistral 429** : l'API peut retourner « capacity » ; réessaie après quelques secondes.
- **Env manquant** : l'app lève une erreur claire si `JWT_SECRET` ou `MISTRAL_API_KEY` absent.

---

© 2025 ComplySummarize IA – Licence MIT 