import { useState, useEffect } from 'react';
import { getRequest } from '../services/api';

export default function RequestDetails({ requestId, onEdit, onBack }) {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRequest();
  }, [requestId]);

  const loadRequest = async () => {
    try {
      setLoading(true);
      const data = await getRequest(requestId);
      setRequest(data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des détails');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calculer la deadline (Date de la demande + Durée en jours)
   */
  const calculateDeadline = () => {
    if (!request?.requestDate || !request?.duration) return '-';
    
    try {
      const days = parseInt(request.duration);
      if (isNaN(days)) return '-';
      
      const date = new Date(request.requestDate);
      date.setDate(date.getDate() + days);
      
      return date.toISOString().split('T')[0];
    } catch (err) {
      console.error('Erreur calcul deadline:', err);
      return '-';
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    if (typeof date === 'string') return date.split('T')[0];
    return date;
  };

  if (loading) return <p className="loading">Chargement...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!request) return <p className="no-data">Demande introuvable</p>;

  return (
    <div className="details-container">
      <div className="details-header">
        <h2>Détails de la Demande #{request.recruitmentCode}</h2>
        <div className="details-actions">
          <button onClick={() => onEdit(requestId)} className="btn-edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Modifier
          </button>
          <button onClick={onBack} className="btn-cancel">
            ← Retour
          </button>
        </div>
      </div>

      <div className="details-content">
        {/* Row 1 */}
        <div className="detail-row">
          <div className="detail-field">
            <label>Code de Recrutement:</label>
            <p className="detail-value">{request.recruitmentCode}</p>
          </div>
          <div className="detail-field">
            <label>Date de Soumission:</label>
            <p className="detail-value">{formatDate(request.submissionDate)}</p>
          </div>
          <div className="detail-field">
            <label>HRBP:</label>
            <p className="detail-value">{request.hrbp || '-'}</p>
          </div>
        </div>

        {/* Row 2 */}
        <div className="detail-row">
          <div className="detail-field">
            <label>Fonction:</label>
            <p className="detail-value">{request.function || '-'}</p>
          </div>
          <div className="detail-field">
            <label>Rattachement:</label>
            <p className="detail-value">{request.attachment || '-'}</p>
          </div>
          <div className="detail-field">
            <label>Contrat:</label>
            <p className="detail-value">{request.contract || '-'}</p>
          </div>
        </div>

        {/* Row 3 */}
        <div className="detail-row">
          <div className="detail-field">
            <label>Date de la Demande:</label>
            <p className="detail-value">{formatDate(request.requestDate)}</p>
          </div>
          <div className="detail-field">
            <label>Nombre à Recruter:</label>
            <p className="detail-value">{request.numberToRecruit}</p>
          </div>
          <div className="detail-field">
            <label>Durée (jours):</label>
            <p className="detail-value">{request.duration || '-'}</p>
          </div>
        </div>

        {/* Row 4 */}
        <div className="detail-row">
          <div className="detail-field">
            <label>Deadline:</label>
            <p className="detail-value deadline-highlight">{calculateDeadline()}</p>
          </div>
          <div className="detail-field">
            <label>Type de Recrutement:</label>
            <p className="detail-value">{request.recruitmentType || '-'}</p>
          </div>
          <div className="detail-field">
            <label>Raison de Recrutement:</label>
            <p className="detail-value">{request.reasonForRecruitment || '-'}</p>
          </div>
        </div>

        {/* Row 5 */}
        <div className="detail-row">
          <div className="detail-field">
            <label>Candidatures Reçues:</label>
            <p className="detail-value">{request.receivedApplications}</p>
          </div>
          <div className="detail-field">
            <label>Entretiens à Planifier:</label>
            <p className="detail-value">{request.interviewsToSchedule || 0}</p>
          </div>
          <div className="detail-field">
            <label>Entretiens Réalisés:</label>
            <p className="detail-value">{request.interviewsConducted}</p>
          </div>
        </div>

        {/* Row 6 */}
        <div className="detail-row">
          <div className="detail-field">
            <label>Phasing:</label>
            <p className="detail-value">{request.phasing || '-'}</p>
          </div>
          <div className="detail-field">
            <label>Date de Clôture:</label>
            <p className="detail-value">{formatDate(request.closureDate) || '-'}</p>
          </div>
          <div className="detail-field">
            <label>Statut:</label>
            <p className="detail-value">
              <span className="status-badge">
                {request.closureDate ? '✓ Fermée' : '⏳ En cours'}
              </span>
            </p>
          </div>
        </div>

        {/* Row 7 */}
        <div className="detail-row full-width">
          <div className="detail-field">
            <label>Commentaires:</label>
            <p className="detail-value comments-text">{request.comments || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
