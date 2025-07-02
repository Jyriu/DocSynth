const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'fallbacksecret';

// Signup
exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Vérifications des champs requis
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Utilisateur déjà existant' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });

    res.status(201).json({ message: 'Utilisateur créé avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Vérifications des champs requis
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Email ou mot de passe invalide' });

    // Vérifier que l'utilisateur a bien un passwordHash
    if (!user.passwordHash) {
      console.error('Utilisateur sans mot de passe haché:', user.email);
      return res.status(400).json({ message: 'Erreur de données utilisateur' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Email ou mot de passe invalide' });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
