import React, { useState, useContext } from 'react';
import { register as registerApi, login as loginApi } from '../utils/api';
import { AuthContext } from '../contexts/AuthContext';
import { saveToken } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setIsAuthenticated } = useContext(AuthContext);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      await registerApi(name, email, password);
      // Après inscription réussie, connecter automatiquement l'utilisateur
      const loginRes = await loginApi(email, password);
      saveToken(loginRes.token);
      setIsAuthenticated(true);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-5 shadow-lg rounded-4 w-100" style={{ maxWidth: '40rem' }}>
        <h2 className="text-center mb-4 fw-bold" style={{ color: '#111' }}>Créer un compte</h2>
        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <div className="input-group">
              <span className="input-group-text bg-white border-dark">
                <i className="bi bi-person"></i>
              </span>
              <input
                type="text"
                className="form-control form-control-lg rounded-3 border-dark text-dark bg-white"
                placeholder="Nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <div className="input-group">
              <span className="input-group-text bg-white border-dark">
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                className="form-control form-control-lg rounded-3 border-dark text-dark bg-white"
                placeholder="Adresse e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <div className="input-group">
              <span className="input-group-text bg-white border-dark">
                <i className="bi bi-lock"></i>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control form-control-lg rounded-3 border-dark text-dark bg-white"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="input-group-text bg-white border-dark"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                style={{ cursor: 'pointer' }}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-dark btn-lg w-100 rounded-3 mb-3" style={{ background: '#111', border: 'none' }} disabled={loading}>
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>
          {error && <div className="alert alert-danger mt-2">{error}</div>}
        </form>
        <div className="text-center mt-2">
          <span className="text-secondary small">Déjà un compte ?</span>
          <a href="/login" className="ms-1 text-decoration-none small">Se connecter</a>
        </div>
      </div>
    </div>
  );
};

export default Register;
