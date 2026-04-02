import { useState, useEffect } from 'react';
import { FiEye, FiEdit2 } from 'react-icons/fi';
import { getAllRequests } from '../services/api';
import './Dashboard.css';

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

  /**
   * Calculer les jours restants et vérifier le dépassement
   */
  const calculateDaysRemaining = (requestDate, durationDays) => {
    if (!requestDate || !durationDays) return { remaining: '-', isOverdue: false, deadline: '-' };
    
    try {
      const days = parseInt(durationDays);
      if (isNaN(days)) return { remaining: '-', isOverdue: false, deadline: '-' };
      
      const startDate = new Date(requestDate);
      const deadline = new Date(startDate);
      deadline.setDate(deadline.getDate() + days);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const remaining = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
      const isOverdue = remaining < 0;
      
      return {
        remaining: Math.abs(remaining),
        isOverdue,
        deadline: deadline.toISOString().split('T')[0]
      };
    } catch (err) {
      console.error('Erreur calcul jours restants:', err);
      return { remaining: '-', isOverdue: false, deadline: '-' };
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
        <div className="table-container-compact">
          <table className="dashboard-table-compact">
            <thead>
              <tr>
                <th>Code</th>
                <th>HRBP</th>
                <th>Fonction</th>
                <th>Rattachement</th>
                <th>Contrat</th>
                <th>Date Demande</th>
                <th>Durée</th>
                <th>À recruter</th>
                <th>Type</th>
                <th>Candidatures</th>
                <th>Entretiens</th>
                <th>À planifier</th>
                <th>Phasing</th>
                <th>Jours Rest.</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => {
                const daysInfo = calculateDaysRemaining(request.requestDate, request.duration);
                const requestDateFormatted = typeof request.requestDate === 'string' ? request.requestDate.split('T')[0] : request.requestDate;
                
                return (
                  <tr key={request.id} className={daysInfo.isOverdue ? 'row-overdue' : ''}>
                    <td className="font-weight-bold text-nowrap">{request.recruitmentCode}</td>
                    <td className="text-nowrap">{request.hrbp || '-'}</td>
                    <td className="text-nowrap">{request.function || '-'}</td>
                    <td className="text-nowrap">{request.attachment || '-'}</td>
                    <td className="text-nowrap">{request.contract || '-'}</td>
                    <td className="text-nowrap">{requestDateFormatted}</td>
                    <td className="text-center text-nowrap">{request.duration || '-'} j</td>
                    <td className="text-center text-nowrap">{request.numberToRecruit || '-'}</td>
                    <td className="text-nowrap text-truncate" title={request.recruitmentType}>{request.recruitmentType || '-'}</td>
                    <td className="text-center text-nowrap">{request.receivedApplications || '-'}</td>
                    <td className="text-center text-nowrap">{request.interviewsConducted || '-'}</td>
                    <td className="text-center text-nowrap">{request.interviewsToSchedule || '-'}</td>
                    <td className="text-center text-nowrap">{request.phasing || '-'}</td>
                    <td className={`text-center text-nowrap days-cell ${daysInfo.isOverdue ? 'overdue' : ''}`}>
                      <span className="days-badge">
                        {daysInfo.isOverdue ? '⚠️ DÉPASSÉ' : daysInfo.remaining + ' j'}
                      </span>
                    </td>
                    <td className="actions-cell-compact">
                      <button
                        onClick={() => onViewDetails(request.id)}
                        className="btn-icon"
                        title="Voir les détails"
                      >
                        <FiEye size={18} />
                      </button>
                      <button
                        onClick={() => onSelectRequest(request.id)}
                        className="btn-icon"
                        title="Modifier"
                      >
                        <FiEdit2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
