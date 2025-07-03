import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { clearToken } from '../utils/auth';

const Navbar = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);

  const handleLogout = () => {
    clearToken();
    setIsAuthenticated(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          ComplySummarize AI
        </Link>
        
        <div className="navbar-nav ms-auto">
          {isAuthenticated ? (
            <div className="d-flex gap-2 align-items-center">
              <Link to="/" className="btn btn-outline-light">
                Accueil
              </Link>
              <Link to="/history" className="btn btn-outline-light">
                Historique
              </Link>
              <button 
                className="btn btn-outline-light" 
                onClick={handleLogout}
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="d-flex gap-2">
              <Link to="/login" className="btn btn-outline-light">
                Connexion
              </Link>
              <Link to="/register" className="btn btn-light">
                Inscription
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
