import { useState, useEffect } from 'react';
import { getAllRequests } from '../services/api';
import './DashboardAnalytics.css';

export default function DashboardAnalytics() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getAllRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculs des statistiques
  const totalToRecruit = requests.reduce((sum, r) => sum + (r.numberToRecruit || 0), 0);
  const totalApplications = requests.reduce((sum, r) => sum + (r.receivedApplications || 0), 0);
  
  const stats = {
    totalRequests: requests.length,
    inProgress: requests.filter(r => !r.closureDate).length,
    completed: requests.filter(r => r.closureDate).length,
    totalToRecruit: totalToRecruit,
    totalApplications: totalApplications,
    totalInterviews: requests.reduce((sum, r) => sum + (r.interviewsConducted || 0), 0),
    totalToSchedule: requests.reduce((sum, r) => sum + (r.interviewsToSchedule || 0), 0),
    functionBreakdown: getFunctionBreakdown(requests),
    attachmentBreakdown: getAttachmentBreakdown(requests),
    hrbpBreakdown: getHRBPBreakdown(requests),
    conversionRate: totalToRecruit > 0 ? Math.round((totalApplications / totalToRecruit * 100) * 10) / 10 : 0
  };

  function getFunctionBreakdown(data) {
    const breakdown = {};
    data.forEach(r => {
      if (!breakdown[r.function]) {
        breakdown[r.function] = { total: 0, completed: 0 };
      }
      breakdown[r.function].total++;
      if (r.closureDate) breakdown[r.function].completed++;
    });
    return Object.entries(breakdown)
      .map(([fn, counts]) => ({ function: fn, ...counts }))
      .sort((a, b) => b.total - a.total);
  }

  function getAttachmentBreakdown(data) {
    const breakdown = {};
    data.forEach(r => {
      if (!breakdown[r.attachment]) {
        breakdown[r.attachment] = { total: 0, completed: 0 };
      }
      breakdown[r.attachment].total++;
      if (r.closureDate) breakdown[r.attachment].completed++;
    });
    return Object.entries(breakdown)
      .map(([att, counts]) => ({ attachment: att || 'Non défini', ...counts }))
      .sort((a, b) => b.total - a.total);
  }

  function getHRBPBreakdown(data) {
    const breakdown = {};
    data.forEach(r => {
      if (!breakdown[r.hrbp]) {
        breakdown[r.hrbp] = { total: 0, completed: 0 };
      }
      breakdown[r.hrbp].total++;
      if (r.closureDate) breakdown[r.hrbp].completed++;
    });
    return Object.entries(breakdown)
      .map(([hrbp, counts]) => ({ hrbp: hrbp || 'Non défini', ...counts }))
      .sort((a, b) => b.total - a.total);
  }

  function getCandidatureRateClass(rate) {
    if (rate === 100) return 'rate-excellent';
    if (rate >= 75) return 'rate-good';
    if (rate >= 50) return 'rate-fair';
    return 'rate-poor';
  }

  if (loading) return <div className="analytics-container"><p>Chargement...</p></div>;

  return (
    <div className="analytics-container">
      <h2>📊 Tableau de Bord Analytique</h2>

      {/* CARTES PRINCIPALES */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalRequests}</div>
            <div className="stat-label">Total Demandes</div>
          </div>
        </div>

        <div className="stat-card inprogress">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-number">{stats.inProgress}</div>
            <div className="stat-label">En Cours</div>
          </div>
        </div>

        <div className="stat-card completed">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{stats.completed}</div>
            <div className="stat-label">Terminées</div>
          </div>
        </div>

        <div className="stat-card rate">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-number">{stats.conversionRate}%</div>
            <div className="stat-label">Taux Candidatures</div>
          </div>
        </div>
      </div>

      {/* MÉTRIQUES DE RECRUTEMENT */}
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>👥 Postes à Pourvoir</h3>
          <div className="metric-value">{stats.totalToRecruit}</div>
        </div>

        <div className="metric-card">
          <h3>📬 Candidatures Reçues</h3>
          <div className="metric-value">{stats.totalApplications}</div>
        </div>

        <div className="metric-card">
          <h3>💬 Entretiens Réalisés</h3>
          <div className="metric-value">{stats.totalInterviews}</div>
        </div>

        <div className="metric-card">
          <h3>📅 Entretiens à Planifier</h3>
          <div className="metric-value">{stats.totalToSchedule}</div>
        </div>
      </div>

      {/* TABLES D'ANALYSE */}
      <div className="analysis-section">
        <div className="analysis-table">
          <h3>📍 Par Fonction</h3>
          <table>
            <thead>
              <tr>
                <th>Fonction</th>
                <th>Total</th>
                <th>Terminées</th>
                <th>En Cours</th>
              </tr>
            </thead>
            <tbody>
              {stats.functionBreakdown.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.function}</td>
                  <td>{item.total}</td>
                  <td>{item.completed}</td>
                  <td>{item.total - item.completed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="analysis-table">
          <h3>🏢 Par Rattachement</h3>
          <table>
            <thead>
              <tr>
                <th>Rattachement</th>
                <th>Total</th>
                <th>Terminées</th>
                <th>En Cours</th>
              </tr>
            </thead>
            <tbody>
              {stats.attachmentBreakdown.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.attachment}</td>
                  <td>{item.total}</td>
                  <td>{item.completed}</td>
                  <td>{item.total - item.completed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="analysis-table">
          <h3>👨‍💼 Par HRBP</h3>
          <table>
            <thead>
              <tr>
                <th>HRBP</th>
                <th>Total</th>
                <th>Terminées</th>
                <th>En Cours</th>
              </tr>
            </thead>
            <tbody>
              {stats.hrbpBreakdown.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.hrbp}</td>
                  <td>{item.total}</td>
                  <td>{item.completed}</td>
                  <td>{item.total - item.completed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CARTES PAR FONCTION - DÉTAILS */}
      <div className="functions-cards-section">
        <h3>📋 Détails par Fonction</h3>
        <div className="functions-cards-grid">
          {requests.map((request, idx) => {
            const candidatureRate = request.numberToRecruit > 0 
              ? Math.round((request.receivedApplications / request.numberToRecruit) * 100)
              : 0;
            const rateClass = getCandidatureRateClass(candidatureRate);
            
            return (
              <div key={idx} className={`function-card ${rateClass} ${request.closureDate ? 'completed' : 'inprogress'}`}>
                <div className="function-card-header">
                  <h4>🎯 {request.function}</h4>
                </div>
                <div className="function-card-content">
                  <div className="function-card-row">
                    <span className="function-card-label">📅 Date Demande:</span>
                    <span className="function-card-value">
                      {new Date(request.requestDate).toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/')}
                    </span>
                  </div>
                  <div className="function-card-row">
                    <span className="function-card-label">👥 Postes à Pourvoir:</span>
                    <span className="function-card-value">{request.numberToRecruit}</span>
                  </div>
                  <div className="function-card-row">
                    <span className="function-card-label">📬 Candidatures:</span>
                    <span className="function-card-value">{request.receivedApplications}</span>
                  </div>
                </div>
                <div className="function-card-footer">
                  <span className="function-card-label">📊 Taux de Candidatures:</span>
                  <div className="function-card-rate">
                    <div className="rate-bar">
                      <div 
                        className="rate-fill" 
                        style={{ width: `${candidatureRate}%` }}
                      ></div>
                    </div>
                    <span className="rate-percentage">{candidatureRate}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
