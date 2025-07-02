import React, { useRef, useState } from 'react';

const Home = () => {
  const fileInputRef = useRef();
  const [fileName, setFileName] = useState('');
  const [summary, setSummary] = useState(`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer feugiat magna ut diam porta, vitae gravida purus ultrices. Vivamus congue nisl sed nisi bibendum, et fermentum lacus iaculis.\nPoints clés :\n• Suspendisse potenti. Proin eu turpis ut sem sagittis accumsan.\n• Donec tempor, ipsum in pretium accumsan, velit leo congue velit.\n• Mauris auctor odio vitae sapien volutpat, a faucibus eros blandit.\nRecommandations :\n• Analyser les sections critiques du document pour une meilleure synthèse.\n• Appliquer les suggestions mentionnées pour améliorer la conformité.\n• Vérifier les délais mentionnés dans les annexes du fichier.`);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleConvert = () => {
    // TODO: Ajouter la logique de conversion et de résumé
    setSummary(summary); // placeholder
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
            <button className="btn btn-dark btn-lg rounded-3" style={{ background: '#111', border: 'none' }} onClick={handleConvert}>Convertir</button>
          </div>
        </div>
        <div className="mb-4">
          <h5 className="fw-bold mb-2">Résumé :</h5>
          <div className="bg-light rounded border p-3" style={{ minHeight: 120 }}>
            {summary.split('\n').map((line, idx) => (
              <div key={idx} className="text-start">{line}</div>
            ))}
          </div>
        </div>
        <div className="d-flex justify-content-end">
          <button className="btn btn-outline-dark btn-lg rounded-3" onClick={handleRestart}>Recommencer</button>
        </div>
      </div>
    </div>
  );
};

export default Home; 