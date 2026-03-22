import { useState, useEffect } from 'react';
import { getAllRequests, getDropdownOptions } from '../services/api';

// Fonction pour formater les dates en YYYY/MM/DD
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

export default function Rapport() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOptions, setDropdownOptions] = useState({
    functions: [],
    attachments: []
  });

  // Filtres
  const [filters, setFilters] = useState({
    dateStart: '',
    dateEnd: '',
    function: '',
    attachment: '',
    status: 'all' // 'all', 'inprogress', 'completed'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allReq, opts] = await Promise.all([
        getAllRequests(),
        getDropdownOptions()
      ]);
      setRequests(allReq);
      setDropdownOptions(opts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Appliquer les filtres
  const filteredRequests = requests.filter(r => {
    if (filters.dateStart && new Date(r.requestDate) < new Date(filters.dateStart)) return false;
    if (filters.dateEnd && new Date(r.requestDate) > new Date(filters.dateEnd)) return false;
    if (filters.function && r.function !== filters.function) return false;
    if (filters.attachment && r.attachment !== filters.attachment) return false;
    if (filters.status === 'inprogress' && r.closureDate) return false;
    if (filters.status === 'completed' && !r.closureDate) return false;
    return true;
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      dateStart: '',
      dateEnd: '',
      function: '',
      attachment: '',
      status: 'all'
    });
  };

  const exportData = () => {
    let csv = 'Code Recrutement,HRBP,Fonction,Rattachement,Nombre à Recruter,Candidatures,Entretiens à Planifier,Entretiens Réalisés,Statut,Date Demande\n';
    
    filteredRequests.forEach(r => {
      csv += `${r.recruitmentCode},"${r.hrbp}","${r.function}","${r.attachment}",${r.numberToRecruit},${r.receivedApplications},${r.interviewsToSchedule},${r.interviewsConducted},"${r.closureDate ? 'Terminée' : 'En cours'}","${r.requestDate}"\n`;
    });

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `rapport_recrutement_${new Date().toISOString().split('T')[0]}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) return <div className="rapport-container"><p>Chargement...</p></div>;

  return (
    <div className="rapport-container">
      <h2>📄 Rapport et Filtres</h2>

      {/* SECTION FILTRES */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Date de Demande De:</label>
            <input
              type="date"
              name="dateStart"
              value={filters.dateStart}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-group">
            <label>Date de Demande À:</label>
            <input
              type="date"
              name="dateEnd"
              value={filters.dateEnd}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-group">
            <label>Fonction:</label>
            <select
              name="function"
              value={filters.function}
              onChange={handleFilterChange}
            >
              <option value="">-- Toutes les fonctions --</option>
              {dropdownOptions.functions.map(fn => (
                <option key={fn} value={fn}>{fn}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Rattachement:</label>
            <select
              name="attachment"
              value={filters.attachment}
              onChange={handleFilterChange}
            >
              <option value="">-- Tous les rattachements --</option>
              {dropdownOptions.attachments.map(att => (
                <option key={att} value={att}>{att}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Statut:</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="all">Tous les statuts</option>
              <option value="inprogress">En Cours</option>
              <option value="completed">Terminées</option>
            </select>
          </div>

          <div className="filter-group buttons">
            <button onClick={resetFilters} className="btn-reset">🔄 Réinitialiser</button>
            <button onClick={exportData} className="btn-export">📥 Exporter CSV</button>
          </div>
        </div>
      </div>

      {/* RÉSULTATS */}
      <div className="results-section">
        <div className="results-header">
          <h3>Résultats: {filteredRequests.length} demande(s)</h3>
        </div>

        {filteredRequests.length === 0 ? (
          <p className="no-results">Aucune demande ne correspond aux critères de filtre</p>
        ) : (
          <div className="table-container">
            <table className="rapport-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>HRBP</th>
                  <th>Fonction</th>
                  <th>Rattachement</th>
                  <th>À Recruter</th>
                  <th>Candidatures</th>
                  <th>Entretiens Planifiés</th>
                  <th>Entretiens Réalisés</th>
                  <th>Statut</th>
                  <th>Date Demande</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request, idx) => (
                  <tr key={idx}>
                    <td><strong>{request.recruitmentCode}</strong></td>
                    <td>{request.hrbp}</td>
                    <td>{request.function}</td>
                    <td>{request.attachment}</td>
                    <td className="text-center">{request.numberToRecruit}</td>
                    <td className="text-center">{request.receivedApplications}</td>
                    <td className="text-center">{request.interviewsToSchedule}</td>
                    <td className="text-center">{request.interviewsConducted}</td>
                    <td>
                      <span className={`status-label ${request.closureDate ? 'completed' : 'inprogress'}`}>
                        {request.closureDate ? '✅ Terminée' : '⏳ En cours'}
                      </span>
                    </td>
                    <td>{formatDate(request.requestDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* STATISTIQUES DES RÉSULTATS */}
        {filteredRequests.length > 0 && (
          <div className="summary-stats">
            <div className="summary-item">
              <span>Total à Recruter:</span>
              <strong>{filteredRequests.reduce((sum, r) => sum + r.numberToRecruit, 0)}</strong>
            </div>
            <div className="summary-item">
              <span>Total Candidatures:</span>
              <strong>{filteredRequests.reduce((sum, r) => sum + r.receivedApplications, 0)}</strong>
            </div>
            <div className="summary-item">
              <span>Entretiens à Planifier:</span>
              <strong>{filteredRequests.reduce((sum, r) => sum + r.interviewsToSchedule, 0)}</strong>
            </div>
            <div className="summary-item">
              <span>Entretiens Réalisés:</span>
              <strong>{filteredRequests.reduce((sum, r) => sum + r.interviewsConducted, 0)}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
