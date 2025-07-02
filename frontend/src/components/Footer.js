import React from 'react';

const Footer = () => (
  <footer className="bg-dark text-white text-center py-3 mt-auto w-100" style={{ letterSpacing: 1, fontSize: '1rem' }}>
    &copy; {new Date().getFullYear()} ComplySummarize IA &mdash; Tous droits réservés
  </footer>
);

export default Footer;
