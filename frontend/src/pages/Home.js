import React, { useRef, useState } from 'react';
import { summarisePdf } from '../utils/api';
import { getToken } from '../utils/auth';

const Home = () => {
  const fileInputRef = useRef();
  const [fileName, setFileName] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleConvert = async () => {
    setError('');
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError('Sélectionnez un PDF avant de convertir.');
      return;
    }
    const token = getToken();
    if (!token) {
      setError('Connectez-vous d\'abord.');
      return;
    }
    try {
      setLoading(true);
      const res = await summarisePdf(file, token);
      setSummary(res.summaryText || 'Résumé non disponible');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erreur lors de la conversion');
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setFileName('');
    setSummary('');
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-5 shadow-lg rounded-4 w-100" style={{ maxWidth: '48rem' }}>
        <h2 className="text-center mb-4 fw-bold" style={{ color: '#111' }}>Accueil</h2>
        <div className="mb-4">
          <label htmlFor="pdf-upload" className="form-label fw-semibold">Sélectionner le fichier PDF</label>
          <div className="input-group mb-2">
            <input
              id="pdf-upload"
              type="file"
              accept="application/pdf"
              ref={fileInputRef}
              className="form-control form-control-lg rounded-3 border border-dark text-dark bg-white"
              style={{ boxShadow: 'none' }}
              onChange={handleFileChange}
            />
            <span className="input-group-text">{fileName ? fileName : <span className="text-muted">Aucun fichier</span>}</span>
          </div>
          <div className="d-flex justify-content-end">
            <button className="btn btn-dark btn-lg rounded-3" style={{ background: '#111', border: 'none' }} onClick={handleConvert} disabled={loading}>{loading ? 'Conversion…' : 'Convertir'}</button>
          </div>
        </div>
        {error && (
          <div className="alert alert-danger" role="alert">{error}</div>
        )}
        {summary && (
          <div className="mb-4">
            <h5 className="fw-bold mb-2">Résumé :</h5>
            <div className="bg-light rounded border p-3" style={{ minHeight: 120 }}>
              {summary.split('\n').map((line, idx) => (
                <div key={idx} className="text-start">{line}</div>
              ))}
            </div>
          </div>
        )}
        <div className="d-flex justify-content-end">
          <button className="btn btn-outline-dark btn-lg rounded-3" onClick={handleRestart}>Recommencer</button>
        </div>
      </div>
    </div>
  );
};

export default Home; 