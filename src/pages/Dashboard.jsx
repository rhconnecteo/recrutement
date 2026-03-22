import { useState, useEffect } from 'react';
import { getAllRequests } from '../services/api';

export default function Dashboard({ onSelectRequest, onViewDetails, onNewRequest }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getAllRequests();
      setRequests(data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des demandes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calculer la deadline (Date de la demande + Durée en jours)
   */
  const calculateDeadline = (requestDate, durationDays) => {
    if (!requestDate || !durationDays) return '-';
    
    try {
      const days = parseInt(durationDays);
      if (isNaN(days)) return '-';
      
      const date = new Date(requestDate);
      date.setDate(date.getDate() + days);
      
      return date.toISOString().split('T')[0];
    } catch (err) {
      console.error('Erreur calcul deadline:', err);
      return '-';
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Demandes de Recrutement</h2>
        <button onClick={onNewRequest} className="btn-new">
          + Nouvelle Demande
        </button>
      </div>

      {loading && <p className="loading">Chargement...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && requests.length === 0 && (
        <p className="no-data">Aucune demande trouvée</p>
      )}

      {!loading && requests.length > 0 && (
        <div className="table-container">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>HRBP</th>
                <th>Fonction</th>
                <th>Date Demande</th>
                <th>Candidatures</th>
                <th>Deadline</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td className="font-weight-bold">{request.recruitmentCode}</td>
                  <td>{request.hrbp}</td>
                  <td>{request.function}</td>
                  <td>{typeof request.requestDate === 'string' ? request.requestDate.split('T')[0] : request.requestDate}</td>
                  <td className="text-center">{request.receivedApplications}</td>
                  <td className="deadline-cell">{calculateDeadline(request.requestDate, request.duration)}</td>
                  <td className="status-cell">
                    <span className={`status-badge ${request.closureDate ? 'completed' : 'inprogress'}`}>
                      {request.closureDate ? '✓ Fermée' : '⏳ En cours'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      onClick={() => onViewDetails(request.id)}
                      className="btn-view"
                      title="Voir les détails"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      Voir
                    </button>
                    <button
                      onClick={() => onSelectRequest(request.id)}
                      className="btn-edit-small"
                      title="Modifier"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      Éditer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
