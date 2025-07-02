import React, { useState } from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    alert(`Connexion avec ${email}`);
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-5 shadow-lg rounded-4 w-100" style={{ maxWidth: '40rem' }}>
        <h2 className="text-center mb-4 fw-bold" style={{ color: '#111' }}>Connexion</h2>
        <form onSubmit={handleLogin}>
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
          <button type="submit" className="btn btn-dark btn-lg w-100 rounded-3 mb-3" style={{ background: '#111', border: 'none' }}>
            Se connecter
          </button>
        </form>
        <div className="text-center mt-2">
          <span className="text-secondary small">Pas encore de compte ?</span>
          <a href="/register" className="ms-1 text-decoration-none small">S'inscrire</a>
        </div>
      </div>
    </div>
  );
};

export default Login; 