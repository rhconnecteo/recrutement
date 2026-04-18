import { useState, useEffect } from 'react';
import { getAllRequests } from '../services/api';
import './DashboardByCDO.css';

export default function DashboardByCDO({ onSelectRequest, onViewDetails }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [groupedByCDO, setGroupedByCDO] = useState({});

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getAllRequests();
      setRequests(data);
      
      // Grouper par CDO
      const grouped = {};
      data.forEach(request => {
        const cdo = request.cdo || 'Non assigné';
        if (!grouped[cdo]) {
          grouped[cdo] = [];
        }
        grouped[cdo].push(request);
      });
      
      setGroupedByCDO(grouped);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des demandes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="loading">Chargement...</p>;
  if (error) return <p className="error-message">{error}</p>;

  const cdoOrder = ['MVOLA', 'YAS', 'OPENFIELD', 'COMETE', 'TERSEA', 'SUPPORT'];
  const sortedCDOs = Object.keys(groupedByCDO).sort((a, b) => {
    const indexA = cdoOrder.indexOf(a);
    const indexB = cdoOrder.indexOf(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <div className="dashboard-by-cdo">
      <h1>Suivi Recrutement - Faits Marquants par Entité</h1>
      
      <div className="cdo-list">
        {sortedCDOs.map((cdo) => {
          const cdoRequests = groupedByCDO[cdo];
          
          return (
            <div key={cdo} className="cdo-section">
              <div className="cdo-section-header" style={{backgroundColor: getHeaderColor(cdo)}}>
                <h2>{cdo}</h2>
              </div>
              
              <div className="cdo-section-subtitle">Suivi Recrutement</div>
              
              <div className="cdo-table-container">
                <table className="cdo-table">
                  <thead>
                    <tr>
                      <th className="col-campagne">Campagne / Poste</th>
                      <th className="col-nb">Détails Recrutement</th>
                      <th className="col-phasing">Phasing / Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cdoRequests.length > 0 ? (
                      cdoRequests.map((request) => (
                        <tr key={request.id} className="request-row">
                          <td className="col-campagne">
                            <div className="function-details">
                              <div className="function-name">{request.function}</div>
                              {request.attachment && (
                                <div className="function-attachment">{request.attachment}</div>
                              )}
                            </div>
                          </td>
                          <td className="col-nb">
                            <div className="nb-details">
                              <div className="nb-header">
                                <span className="nb-label">À recruter:</span>
                                <span className="nb-value">{request.numberToRecruit || 0}</span>
                              </div>
                              <div className="nb-row">
                                <span className="nb-label">Candidatures:</span>
                                <span className="nb-value">{request.totalCandidatures || 0}</span>
                              </div>
                              <div className="nb-row">
                                <span className="nb-label">Entretiens:</span>
                                <span className="nb-value">{request.interviewsConducted || 0}</span>
                              </div>
                              <div className="nb-row">
                                <span className="nb-label">À planifier:</span>
                                <span className="nb-value">{request.interviewsToSchedule || 0}</span>
                              </div>
                              <div className="nb-row">
                                <span className="nb-label">Type:</span>
                                <span className="nb-value-small">{request.recruitmentType || '-'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="col-phasing">
                            <div className="phasing-details">
                              <div className="phasing-header">
                                <span className="phasing-label">{request.phasing || 'Non défini'}</span>
                              </div>
                              <div className="phasing-comments">
                                {request.comments ? (
                                  <p>{request.comments}</p>
                                ) : (
                                  <p className="no-comments">Aucun commentaire</p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="no-recruitment">
                          Pas de recrutement en cours pour cette entité
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getHeaderColor(cdo) {
  const colors = {
    'MVOLA': '#E83E8C',      // Rose/Magenta
    'YAS': '#20C997',         // Vert/Cyan
    'OPENFIELD': '#28A745',   // Vert
    'COMETE': '#FFC107',      // Orange
    'TERSEA': '#FF9800',      // Orange foncé
    'SUPPORT': '#9C27B0'      // Violet
  };
  return colors[cdo] || '#6C757D'; // Gris par défaut
}
