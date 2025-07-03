import React, { useEffect, useState } from 'react';
import { fetchHistory } from '../utils/api';
import { getToken } from '../utils/auth';
import { marked } from 'marked';
import { jsPDF } from 'jspdf';

marked.setOptions({
  breaks: true,
  mangle: false,
  headerIds: false,
});

const History = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = getToken();
        if (!token) {
          setError('Connectez-vous.');
          return;
        }
        const history = await fetchHistory(token);
        setItems(history);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Erreur lors du chargement de l\'historique');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDownloadPdf = (title, summaryText) => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'p' });
    const marginLeft = 15;
    const marginTop = 20;
    const maxLineWidth = 180;
    const lineHeight = 7;

    if (title) {
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(`Résumé de : ${title}`, marginLeft, marginTop - 8);
    }

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    const lines = doc.splitTextToSize(summaryText, maxLineWidth);
    let y = marginTop;
    lines.forEach((line) => {
      if (y > 280) {
        doc.addPage();
        y = marginTop;
      }
      doc.text(line, marginLeft, y);
      y += lineHeight;
    });

    doc.save(`${title || 'resume'}.pdf`);
  };

  if (loading) return <div className="container py-5 text-center">Chargement…</div>;
  if (error) return <div className="container py-5 alert alert-danger">{error}</div>;

  return (
    <div className="container py-5">
      <h2 className="mb-4 fw-bold">Historique des résumés</h2>
      {items.length === 0 ? (
        <p>Aucun résumé pour le moment.</p>
      ) : (
        <div className="accordion" id="historyAccordion">
          {items.map((item) => (
            <div className="accordion-item" key={item._id}>
              <h2 className="accordion-header" id={`heading-${item._id}`}>
                <button
                  className={`accordion-button ${openId === item._id ? '' : 'collapsed'}`}
                  type="button"
                  onClick={() => setOpenId(openId === item._id ? null : item._id)}
                  aria-expanded={openId === item._id}
                  aria-controls={`collapse-${item._id}`}
                >
                  {item.documentId?.title || 'Document'} – {new Date(item.createdAt).toLocaleString('fr-FR')}
                </button>
              </h2>
              {openId === item._id && (
                <div className="accordion-collapse show" aria-labelledby={`heading-${item._id}`}> 
                  <div className="accordion-body">
                    <div
                      className="bg-light rounded border p-3 mb-3"
                      style={{ maxHeight: '40vh', overflowY: 'auto' }}
                      dangerouslySetInnerHTML={{ __html: marked.parse(item.summaryText) }}
                    />
                    <button
                      className="btn btn-dark btn-sm"
                      onClick={() => handleDownloadPdf(item.documentId?.title, item.summaryText)}
                    >
                      Télécharger le résumé (PDF)
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History; 