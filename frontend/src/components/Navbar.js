import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom shadow-sm py-3">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold fs-4" style={{ color: '#111' }} to="/">ComplySummarize IA</Link>
        <div className="d-flex align-items-center gap-2">
          {isHome ? (
            <button className="btn btn-dark btn-lg rounded-3" style={{ background: '#111', border: 'none' }}>Déconnexion</button>
          ) : (
            <>
              <Link className="btn btn-outline-dark btn-lg rounded-3 me-2" to="/login" style={{ borderWidth: 2 }}>Connexion</Link>
              <Link className="btn btn-dark btn-lg rounded-3" to="/register" style={{ background: '#111', border: 'none' }}>Inscription</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
