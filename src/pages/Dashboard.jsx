import { useState, useEffect } from 'react';
import { FiEye, FiEdit2, FiDownload, FiRefreshCw } from 'react-icons/fi';
import { getAllRequests } from '../services/api';
import './Dashboard.css';

export default function Dashboard({ onSelectRequest, onViewDetails, onNewRequest }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, ongoing, overdue, urgent, completed
  const [sortConfig, setSortConfig] = useState({ key: 'recruitmentCode', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  /**
   * Calculer les jours restants et le statut d'urgence
   */
  const calculateDaysRemaining = (requestDate, durationDays) => {
    if (!requestDate || !durationDays) return { remaining: '-', status: 'normal', isOverdue: false };
    
    try {
      const days = parseInt(durationDays);
      if (isNaN(days)) return { remaining: '-', status: 'normal', isOverdue: false };
      
      const startDate = new Date(requestDate);
      const deadline = new Date(startDate);
      deadline.setDate(deadline.getDate() + days);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const remaining = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
      let status = 'comfortable';
      
      if (remaining < 0) {
        status = 'critical';
      } else if (remaining <= 3) {
        status = 'critical';
      } else if (remaining <= 7) {
        status = 'urgent';
      } else if (remaining <= 14) {
        status = 'normal';
      }
      
      return {
        remaining: Math.abs(remaining),
        status,
        isOverdue: remaining < 0
      };
    } catch (err) {
      console.error('Erreur calcul jours restants:', err);
      return { remaining: '-', status: 'normal', isOverdue: false };
    }
  };

  /**
   * Calculer le statut de progression (pourcentage)
   */
  const getProgressionStatus = (request) => {
    try {
      const interviewsConducted = parseInt(request.interviewsConducted) || 0;
      const numberToRecruit = parseInt(request.numberToRecruit) || 1;
      
      // Calculer le pourcentage: (entretiens conduits / nombre à recruter) * 100
      const percent = Math.min((interviewsConducted / numberToRecruit) * 100, 100);
      
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

      // Appliquer les filtres
      const daysInfo = calculateDaysRemaining(request.requestDate, request.duration);
      
      switch (filterType) {
        case 'overdue':
          return daysInfo.isOverdue;
        case 'urgent':
          return daysInfo.status === 'urgent' || daysInfo.status === 'critical';
        case 'completed':
          return parseInt(request.interviewsConducted) >= parseInt(request.numberToRecruit);
        case 'ongoing':
        default:
          return !daysInfo.isOverdue;
      }
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
          aValue = calculateDaysRemaining(a.requestDate, a.duration).status;
          bValue = calculateDaysRemaining(b.requestDate, b.duration).status;
          const statusOrder = { critical: 0, urgent: 1, normal: 2, comfortable: 3 };
          aValue = statusOrder[aValue] || 3;
          bValue = statusOrder[bValue] || 3;
          break;
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
    
    const headers = ['Code', 'HRBP', 'Fonction', 'Rattachement', 'Contrat', 'Date Demande', 'Durée', 'À recruter', 'Type', 'Candidatures', 'Entretiens', 'À planifier', 'Phasing', 'Jours Restants', 'Statut'];
    
    const rows = filteredRequests.map(request => {
      const daysInfo = calculateDaysRemaining(request.requestDate, request.duration);
      return [
        request.recruitmentCode,
        request.hrbp || '-',
        request.function || '-',
        request.attachment || '-',
        request.contract || '-',
        typeof request.requestDate === 'string' ? request.requestDate.split('T')[0] : request.requestDate,
        request.duration || '-',
        request.numberToRecruit || '-',
        request.recruitmentType || '-',
        request.receivedApplications || '-',
        request.interviewsConducted || '-',
        request.interviewsToSchedule || '-',
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

  // Calculer les statistiques
  const stats = {
    total: requests.length,
    ongoing: requests.filter(r => {
      const daysInfo = calculateDaysRemaining(r.requestDate, r.duration);
      return !daysInfo.isOverdue;
    }).length,
    overdue: requests.filter(r => {
      const daysInfo = calculateDaysRemaining(r.requestDate, r.duration);
      return daysInfo.isOverdue;
    }).length,
    completed: requests.filter(r => {
      return parseInt(r.interviewsConducted) >= parseInt(r.numberToRecruit);
    }).length
  };

  // Obtenir les données paginées
  const filteredRequests = getFilteredRequests();
  const sortedRequests = getSortedRequests(filteredRequests);
  const totalPages = Math.ceil(sortedRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = sortedRequests.slice(startIndex, startIndex + itemsPerPage);

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
        <div className="stat-card stat-completed">
          <div className="stat-number">{stats.completed}</div>
          <div className="stat-label">✓ Complétées</div>
        </div>
      </div>

      {/* Recherche et Filtres */}
      <div className="search-filter-container">
        <input
          type="text"
          placeholder="Rechercher par Code, HRBP, Fonction..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // réinitialiser à la page 1
          }}
        />
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => { setFilterType('all'); setCurrentPage(1); }}
          >
            Tous
          </button>
          <button
            className={`filter-btn ${filterType === 'ongoing' ? 'active' : ''}`}
            onClick={() => { setFilterType('ongoing'); setCurrentPage(1); }}
          >
            En cours
          </button>
          <button
            className={`filter-btn ${filterType === 'urgent' ? 'active' : ''}`}
            onClick={() => { setFilterType('urgent'); setCurrentPage(1); }}
          >
            Urgentes
          </button>
          <button
            className={`filter-btn ${filterType === 'overdue' ? 'active' : ''}`}
            onClick={() => { setFilterType('overdue'); setCurrentPage(1); }}
          >
            Dépassées
          </button>
          <button
            className={`filter-btn ${filterType === 'completed' ? 'active' : ''}`}
            onClick={() => { setFilterType('completed'); setCurrentPage(1); }}
          >
            Complétées
          </button>
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
                  <th onClick={() => handleSort('recruitmentCode')} className="sortable">
                    Code {sortConfig.key === 'recruitmentCode' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </th>
                  <th>HRBP</th>
                  <th>Fonction</th>
                  <th>Rattachement</th>
                  <th>Contrat</th>
                  <th onClick={() => handleSort('requestDate')} className="sortable">
                    Date {sortConfig.key === 'requestDate' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </th>
                  <th>Durée</th>
                  <th>À recruter</th>
                  <th>Type</th>
                  <th>Candidatures</th>
                  <th>Entretiens</th>
                  <th>À planifier</th>
                  <th>Phasing</th>
                  <th onClick={() => handleSort('daysRemaining')} className="sortable">
                    Jours {sortConfig.key === 'daysRemaining' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </th>
                  <th>Progression</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRequests.map((request) => {
                  const daysInfo = calculateDaysRemaining(request.requestDate, request.duration);
                  const requestDateFormatted = typeof request.requestDate === 'string' ? request.requestDate.split('T')[0] : request.requestDate;
                  const progressPercent = getProgressionStatus(request);
                  const statusClass = `status-${daysInfo.status}`;
                  
                  return (
                    <tr key={request.id} className={statusClass}>
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
                      <td className={`text-center text-nowrap days-cell ${daysInfo.status}`}>
                        <span className="days-badge">
                          {daysInfo.isOverdue ? '❌' : '✓'} {daysInfo.remaining} j
                        </span>
                      </td>
                      <td>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
                          <span className="progress-text">{progressPercent}%</span>
                        </div>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                ← Précédent
              </button>
              <span className="pagination-info">
                Page {currentPage} sur {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Suivant →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
