import { useState, useEffect, useMemo, useCallback } from 'react';
import { FiEye, FiEdit2, FiDownload, FiRefreshCw } from 'react-icons/fi';
import { getAllRequests } from '../services/api';
import './Dashboard.css';

export default function Dashboard({ onSelectRequest, onViewDetails, onNewRequest }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [hrbpFilter, setHrbpFilter] = useState('');
  const [attachmentFilter, setAttachmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [delayFilter, setDelayFilter] = useState('all');
  const [startRequestDate, setStartRequestDate] = useState('');
  const [endRequestDate, setEndRequestDate] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'recruitmentCode', direction: 'asc' });

  // Auto-refresh toutes les 5 minutes
  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 5 * 60 * 1000);
    return () => clearInterval(interval);
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

  // Calculer les jours ouvrables entre deux dates (inclusif)
  function businessDaysBetween(startValue, endValue) {
    if (!startValue || !endValue) return 0;
    const start = new Date(startValue);
    const end = new Date(endValue);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    let count = 0;
    let current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    const step = end >= start ? 1 : -1;
    while ((step === 1 && current <= last) || (step === -1 && current >= last)) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count += 1;
      current.setDate(current.getDate() + step);
    }
    return count;
  }

  // Calculer les jours ouvrables restants entre aujourd'hui (exclu) et la date de fin (incluse)
  function businessDaysRemaining(startValue, endValue) {
    if (!startValue || !endValue) return 0;
    const start = new Date(startValue);
    const end = new Date(endValue);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    if (start > end) return -businessDaysRemaining(end, start);

    let count = 0;
    const current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    current.setDate(current.getDate() + 1);
    const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    while (current <= last) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count += 1;
      current.setDate(current.getDate() + 1);
    }
    return count;
  }

  // Différence de jours ouvrables signée
  function businessDaysDiff(startValue, endValue) {
    if (!startValue || !endValue) return 0;
    const start = new Date(startValue);
    const end = new Date(endValue);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    if (end >= start) {
      return businessDaysBetween(start, end);
    }
    return -businessDaysBetween(end, start);
  }

  // Compute deadline date (skip weekends) based on requestDate and duration (business days)
  const computeDeadline = (requestDate, durationDays) => {
    if (!requestDate || !durationDays) return '';
    const days = parseInt(durationDays);
    if (isNaN(days)) return '';
    const date = new Date(requestDate);
    let remaining = days;
    while (remaining > 0) {
      date.setDate(date.getDate() + 1);
      const d = date.getDay();
      if (d !== 0 && d !== 6) remaining -= 1;
    }
    return date.toISOString().split('T')[0];
  };

  /**
   * Calculer les jours restants et le statut d'urgence
   */
  const calculateDaysRemaining = (requestDate, durationDays) => {
    if (!requestDate || !durationDays) return { remaining: '-', status: 'normal', isOverdue: false };
    try {
      const days = parseInt(durationDays);
      if (isNaN(days)) return { remaining: '-', status: 'normal', isOverdue: false };

      const deadlineDateString = computeDeadline(requestDate, days);
      if (!deadlineDateString) return { remaining: '-', status: 'normal', isOverdue: false };

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const deadline = new Date(deadlineDateString);

      const remainingBusinessDays = businessDaysDiff(today, deadline);
      let status = 'comfortable';
      if (remainingBusinessDays < 0 || remainingBusinessDays <= 3) {
        status = 'critical';
      } else if (remainingBusinessDays <= 7) {
        status = 'urgent';
      } else if (remainingBusinessDays <= 14) {
        status = 'normal';
      }

      return {
        remaining: Math.abs(remainingBusinessDays),
        status,
        isOverdue: remainingBusinessDays < 0
      };
    } catch (err) {
      console.error('Erreur calcul jours restants:', err);
      return { remaining: '-', status: 'normal', isOverdue: false };
    }
  };

  /**
   * Calculer le statut de progression (pourcentage)
   * - Si clôturé (closureDate remplie): 100%
   * - Si non clôturé mais taux recrutement >= 100%: 75%
   * - Si non clôturé et taux recrutement < 100%: progression proportionnelle < 75%
   */
  const getProgressionStatus = (request) => {
    try {
      // Si la date de clôture est remplie, la progression est 100%
      if (request.closureDate && request.closureDate.toString().trim() !== '') {
        return 100;
      }

      const interviewsConducted = parseInt(request.interviewsConducted) || 0;
      const numberToRecruit = parseInt(request.numberToRecruit) || 1;
      
      // Calculer le taux: (entretiens conduits / nombre à recruter) * 100
      const recruitmentRate = (interviewsConducted / numberToRecruit) * 100;
      
      // Si taux recrutement >= 100%, progression = 75%
      if (recruitmentRate >= 100) {
        return 75;
      }
      
      // Sinon, progression proportionnelle jusqu'à 75% max
      const percent = Math.min((recruitmentRate / 100) * 75, 75);
      
      return Math.round(percent);
    } catch (err) {
      console.error('Erreur calcul progression:', err);
      return 0;
    }
  };

  /**
   * Filtrer les demandes selon le terme de recherche et le type de filtre
   */
  const getFilteredRequests = () => {
    let filtered = requests.filter(request => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        (request.recruitmentCode || '').toLowerCase().includes(searchLower) ||
        (request.hrbp || '').toLowerCase().includes(searchLower) ||
        (request.function || '').toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
      if (hrbpFilter && request.hrbp !== hrbpFilter) return false;
      if (attachmentFilter && request.attachment !== attachmentFilter) return false;

      const requestDate = request.requestDate ? new Date(request.requestDate) : null;
      if (startRequestDate && requestDate && requestDate < new Date(startRequestDate)) return false;
      if (endRequestDate && requestDate && requestDate > new Date(endRequestDate)) return false;

      const deadline = computeDeadline(request.requestDate, request.duration);
      let respecte = 'indetermine';
      if (!request.annule && request.closureDate && deadline) {
        const cd = new Date(request.closureDate);
        const dl = new Date(deadline);
        respecte = cd <= dl ? 'respecte' : 'nonRespecte';
      }
      if (delayFilter !== 'all' && delayFilter !== respecte) return false;

      let status = 'En cours';
      if (request.annule && request.annule.toString().trim() !== '') status = 'Annulé';
      else if (request.closureDate && request.closureDate.toString().trim() !== '') status = 'Clôturé';
      else if (request.terminal && request.terminal.toString().trim() !== '') status = 'Terminé';
      if (statusFilter !== 'all' && status !== statusFilter) return false;

      return true;
    });

    return filtered;
  };

  /**
   * Trier les demandes
   */
  const getSortedRequests = (dataToSort) => {
    const sorted = [...dataToSort].sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case 'recruitmentCode':
          aValue = a.recruitmentCode || '';
          bValue = b.recruitmentCode || '';
          break;
        case 'requestDate':
          aValue = new Date(a.requestDate || 0);
          bValue = new Date(b.requestDate || 0);
          break;
        case 'daysRemaining':
          aValue = calculateDaysRemaining(a.requestDate, a.duration).remaining;
          bValue = calculateDaysRemaining(b.requestDate, b.duration).remaining;
          aValue = typeof aValue === 'string' ? 999 : parseInt(aValue);
          bValue = typeof bValue === 'string' ? 999 : parseInt(bValue);
          break;
        case 'status':
        {
          aValue = calculateDaysRemaining(a.requestDate, a.duration).status;
          bValue = calculateDaysRemaining(b.requestDate, b.duration).status;
          const statusOrder = { critical: 0, urgent: 1, normal: 2, comfortable: 3 };
          aValue = statusOrder[aValue] || 3;
          bValue = statusOrder[bValue] || 3;
          break;
        }
        default:
          return 0;
      }

      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  };

  /**
   * Exporter les données en CSV
   */
  const exportToCSV = () => {
    const filteredRequests = getFilteredRequests();
    
    const headers = ['Code', 'HRBP', 'Fonction', 'Rattachement', 'CDO', 'Contrat', 'Date Demande', 'Durée', 'À recruter', 'Type', 'Candidatures', 'Entretiens', 'À planifier', 'Phasing', 'Jours Restants', 'Statut'];
    
    const rows = filteredRequests.map(request => {
      const daysInfo = calculateDaysRemaining(request.requestDate, request.duration);
      return [
        request.recruitmentCode,
        request.hrbp || '-',
        request.function || '-',
        request.attachment || '-',
        request.cdo || '-',
        request.contract || '-',
        typeof request.requestDate === 'string' ? request.requestDate.split('T')[0] : request.requestDate,
        request.duration || '-',
        request.numberToRecruit || '-',
        request.recruitmentType || '-',
        request.totalCandidatures || 0,
        request.interviewsConducted || 0,
        request.interviewsToSchedule || 0,
        request.phasing || '-',
        daysInfo.isOverdue ? 'DÉPASSÉ' : daysInfo.remaining + ' j',
        daysInfo.status
      ];
    });

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recrutements-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  /**
   * Gérer le tri au clic sur l'en-tête
   */
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getRequestStatus = (request) => {
    if (request.annule && request.annule.toString().trim() !== '') return 'Annulé';
    if (request.closureDate && request.closureDate.toString().trim() !== '') return 'Clôturé';
    if (request.terminal && request.terminal.toString().trim() !== '') return 'Terminé';
    return 'En cours';
  };

  // Calculer les statistiques (memoized)
  const stats = useMemo(() => ({
    total: requests.length,
    ongoing: requests.filter(r => getRequestStatus(r) === 'En cours').length,
    overdue: requests.filter(r => getRequestStatus(r) === 'En cours' && calculateDaysRemaining(r.requestDate, r.duration).isOverdue).length,
    completed: requests.filter(r => getRequestStatus(r) === 'Clôturé' || getRequestStatus(r) === 'Terminé').length,
    cancelled: requests.filter(r => getRequestStatus(r) === 'Annulé').length
  }), [requests]);

  const filteredRequests = useMemo(() => getFilteredRequests(), [requests, searchTerm, hrbpFilter, attachmentFilter, statusFilter, delayFilter, startRequestDate, endRequestDate]);
  const sortedRequests = useMemo(() => getSortedRequests(filteredRequests), [filteredRequests, sortConfig]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Demandes de Recrutement</h2>
        <div className="header-actions">
          <button onClick={loadRequests} className="btn-refresh" title="Actualiser">
            <FiRefreshCw size={18} />
          </button>
          <button onClick={exportToCSV} className="btn-export" title="Exporter en CSV">
            <FiDownload size={18} /> Exporter
          </button>
          <button onClick={onNewRequest} className="btn-new">
            + Nouvelle Demande
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card stat-ongoing">
          <div className="stat-number">{stats.ongoing}</div>
          <div className="stat-label">En cours</div>
        </div>
        <div className="stat-card stat-overdue">
          <div className="stat-number">{stats.overdue}</div>
          <div className="stat-label">⚠️ Dépassées</div>
        </div>
        <div className="stat-card stat-cancelled">
          <div className="stat-number">{stats.cancelled}</div>
          <div className="stat-label">Annulées</div>
        </div>
        <div className="stat-card stat-completed">
          <div className="stat-number">{stats.completed}</div>
          <div className="stat-label">✓ Complétées</div>
        </div>
      </div>

      {/* Recherche et Filtres */}
      <div className="search-filter-container">
        <div className="filters-grid">
          <input
            type="text"
            placeholder="Recherche par code, HRBP, fonction..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={hrbpFilter}
            onChange={(e) => setHrbpFilter(e.target.value)}
          >
            <option value="">Tous les HRBP</option>
            {Array.from(new Set(requests.map(r => r.hrbp).filter(Boolean))).sort().map(hrbp => (
              <option key={hrbp} value={hrbp}>{hrbp}</option>
            ))}
          </select>
          <select
            value={attachmentFilter}
            onChange={(e) => setAttachmentFilter(e.target.value)}
          >
            <option value="">Tous les Rattachements</option>
            {Array.from(new Set(requests.map(r => r.attachment).filter(Boolean))).sort().map(att => (
              <option key={att} value={att}>{att}</option>
            ))}
          </select>
          <div className="date-filter-group">
            <label>Date de la demande</label>
            <div className="date-filter-row">
              <input
                type="date"
                value={startRequestDate}
                onChange={(e) => setStartRequestDate(e.target.value)}
              />
              <span>à</span>
              <input
                type="date"
                value={endRequestDate}
                onChange={(e) => setEndRequestDate(e.target.value)}
              />
            </div>
          </div>
          <select
            value={delayFilter}
            onChange={(e) => setDelayFilter(e.target.value)}
          >
            <option value="all">Tous les délais</option>
            <option value="respecte">Respecté</option>
            <option value="nonRespecte">Non respecté</option>
            <option value="indetermine">Non déterminé</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="En cours">En cours</option>
            <option value="Clôturé">Clôturé</option>
            <option value="Terminé">Terminé</option>
            <option value="Annulé">Annulé</option>
          </select>
        </div>
      </div>

      {loading && <p className="loading">Chargement...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && sortedRequests.length === 0 && (
        <p className="no-data">Aucune demande trouvée</p>
      )}

      {!loading && sortedRequests.length > 0 && (
        <>
          <div className="table-container-compact">
            <table className="dashboard-table-compact">
              <thead>
                <tr>
                  <th>HRBP</th>
                  <th>Fonction</th>
                  <th>Contrat</th>
                  <th onClick={() => handleSort('requestDate')} className="sortable">Date de la demande {sortConfig.key === 'requestDate' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                  <th>Nombre à recruter</th>
                  <th>Date de deadline</th>
                  <th>Date de clôture</th>
                  <th>Respecté</th>
                  <th>Statut</th>
                  <th>Jours restants</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedRequests.map((request) => {
                  const requestDateFormatted = typeof request.requestDate === 'string' ? request.requestDate.split('T')[0] : request.requestDate;
                  const deadline = computeDeadline(request.requestDate, request.duration);
                  const closureDate = request.closureDate ? (typeof request.closureDate === 'string' ? request.closureDate.split('T')[0] : request.closureDate) : '';

                  // Status priority: Annulé > Clôturé > Terminé > En cours
                  let status = getRequestStatus(request);

                  // Respecté logic: only meaningful when not cancelled and closureDate exists
                  let respecte = '-';
                  if (status !== 'Annulé' && closureDate && deadline) {
                    const dl = new Date(deadline);
                    const cd = new Date(closureDate);
                    respecte = (cd <= dl) ? 'Respecté' : 'Non respecté';
                  }

                  // Days remaining: only for open requests
                  const todayStr = new Date().toISOString().split('T')[0];
                  const daysRemaining = closureDate ? null : businessDaysDiff(todayStr, deadline);
                  const daysInfo = calculateDaysRemaining(request.requestDate, request.duration);
                  const isOverdue = !closureDate && daysInfo.isOverdue;

                  return (
                    <tr key={request.id} className={
                      status === 'Annulé' ? 'status-cancelled' :
                      status === 'Clôturé' ? 'status-completed' :
                      status === 'Terminé' ? 'status-terminated' :
                      isOverdue ? 'status-overdue' : 'status-open'
                    }>
                      <td className="text-nowrap">{request.hrbp || '-'}</td>
                      <td className="text-nowrap">{request.function || '-'}</td>
                      <td className="text-nowrap">{request.contract || '-'}</td>
                      <td className="text-nowrap">{requestDateFormatted}</td>
                      <td className="text-center text-nowrap">{request.numberToRecruit || '-'}</td>
                      <td className="text-center text-nowrap">{deadline || '-'}</td>
                      <td className="text-center text-nowrap">{closureDate || '-'}</td>
                      <td className="text-center text-nowrap">{respecte}</td>
                      <td className="text-nowrap">
                        <span className={`status-badge ${status === 'Annulé' ? 'status-cancelled' : status === 'Clôturé' ? 'status-completed' : status === 'Terminé' ? 'status-terminated' : 'status-open'}`}>
                          {status}
                        </span>
                      </td>
                      <td className="text-center text-nowrap">{closureDate ? '-' : (typeof daysRemaining === 'number' ? (daysRemaining === 0 ? '0' : daysRemaining + ' j') : '-')}</td>
                      <td className="actions-cell-compact">
                        <button onClick={() => onViewDetails(request.id)} className="btn-icon" title="Voir les détails"><FiEye size={18} /></button>
                        <button onClick={() => onSelectRequest(request.id)} className="btn-icon" title="Modifier"><FiEdit2 size={18} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </>
      )}
    </div>
  );
}
