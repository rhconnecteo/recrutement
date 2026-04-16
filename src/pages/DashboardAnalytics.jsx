import { useState, useEffect, useMemo } from 'react';
import { getAllRequests } from '../services/api';
import { MdAssignment, MdHourglassBottom, MdCheckCircle, MdTrendingUp } from 'react-icons/md';
import './DashboardAnalytics.css';

export default function DashboardAnalytics() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState('');

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

  // Helper functions - defined at component level
  const getSourceStats = (data) => {
    const sources = {
      'Facebook': { candidatures: 0, entretiens: 0 },
      'LinkedIn': { candidatures: 0, entretiens: 0 },
      'Success Corner': { candidatures: 0, entretiens: 0 },
      'Interne': { candidatures: 0, entretiens: 0 },
      'Speed Recruiting': { candidatures: 0, entretiens: 0 }
    };

    data.forEach(r => {
      if (r.sourceData) {
        Object.entries(r.sourceData).forEach(([source, data]) => {
          if (sources[source]) {
            sources[source].candidatures += data.candidatures || 0;
            sources[source].entretiens += data.entretiensRealisés || 0;
          }
        });
      }
    });

    return Object.entries(sources)
      .map(([source, stats]) => ({
        source,
        candidatures: stats.candidatures,
        entretiens: stats.entretiens,
        taux: stats.candidatures > 0 ? Math.round((stats.entretiens / stats.candidatures) * 100 * 10) / 10 : 0
      }))
      .sort((a, b) => b.candidatures - a.candidatures);
  };

  const getPoleStats = (data) => {
    const poles = {};
    
    data.forEach(r => {
      if (!poles[r.pole]) {
        poles[r.pole] = { 
          requests: 0, 
          postes: 0, 
          candidatures: 0, 
          entretiens: 0,
          completed: 0 
        };
      }
      poles[r.pole].requests++;
      poles[r.pole].postes += r.numberToRecruit || 0;
      poles[r.pole].candidatures += r.totalCandidatures || 0;
      poles[r.pole].entretiens += r.interviewsConducted || 0;
      if (r.closureDate) poles[r.pole].completed++;
    });

    return Object.entries(poles)
      .map(([pole, stats]) => ({
        pole: pole || 'Non défini',
        ...stats,
        recruitmentRate: stats.candidatures > 0 ? Math.round((stats.entretiens / stats.candidatures) * 100 * 10) / 10 : 0,
        avgCandidatures: stats.requests > 0 ? Math.round((stats.candidatures / stats.requests) * 10) / 10 : 0
      }))
      .sort((a, b) => b.candidatures - a.candidatures);
  };

  const getFunctionBreakdown = (data) => {
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
  };

  const getAttachmentBreakdown = (data) => {
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
  };

  const getHRBPBreakdown = (data) => {
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
  };

  const getCandidatureRateClass = (rate) => {
    if (rate === 100) return 'rate-excellent';
    if (rate >= 75) return 'rate-good';
    if (rate >= 50) return 'rate-fair';
    return 'rate-poor';
  };

  // Filter requests by code
  const filteredRequests = useMemo(() => 
    requests.filter(request =>
      (request.recruitmentCode || '').toLowerCase().includes(searchCode.toLowerCase())
    ), 
    [requests, searchCode]
  );

  // Calculate stats based on filtered data
  const stats = useMemo(() => {
    const totalToRecruit = filteredRequests.reduce((sum, r) => sum + (r.numberToRecruit || 0), 0);
    const totalApplications = filteredRequests.reduce((sum, r) => sum + (r.totalCandidatures || 0), 0);
    const totalInterviews = filteredRequests.reduce((sum, r) => sum + (r.interviewsConducted || 0), 0);
    
    const recruitmentRate = totalApplications > 0 ? Math.round((totalInterviews / totalApplications) * 100 * 10) / 10 : 0;
    
    return {
      totalRequests: filteredRequests.length,
      inProgress: filteredRequests.filter(r => !r.closureDate).length,
      completed: filteredRequests.filter(r => r.closureDate).length,
      totalToRecruit: totalToRecruit,
      totalApplications: totalApplications,
      totalInterviews: totalInterviews,
      totalToSchedule: filteredRequests.reduce((sum, r) => sum + (r.interviewsToSchedule || 0), 0),
      functionBreakdown: getFunctionBreakdown(filteredRequests),
      attachmentBreakdown: getAttachmentBreakdown(filteredRequests),
      hrbpBreakdown: getHRBPBreakdown(filteredRequests),
      conversionRate: totalToRecruit > 0 ? Math.round((totalApplications / totalToRecruit * 100) * 10) / 10 : 0,
      recruitmentRate: recruitmentRate,
      sourceStats: getSourceStats(filteredRequests),
      poleStats: getPoleStats(filteredRequests)
    };
  }, [filteredRequests]);

  if (loading) return <div className="analytics-container"><p>Chargement...</p></div>;

  return (
    <div className="analytics-container">
      <h2>📊 Tableau de Bord Analytique</h2>

      {/* FILTRE DE RECHERCHE */}
      <div className="search-filter-container">
        <input
          type="text"
          placeholder="Rechercher par Code de Recrutement..."
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          className="search-filter-input"
        />
      </div>

      {/* CARTES PRINCIPALES */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon"><MdAssignment /></div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalRequests}</div>
            <div className="stat-label">Total Demandes</div>
          </div>
        </div>

        <div className="stat-card inprogress">
          <div className="stat-icon"><MdHourglassBottom /></div>
          <div className="stat-content">
            <div className="stat-number">{stats.inProgress}</div>
            <div className="stat-label">En Cours</div>
          </div>
        </div>

        <div className="stat-card completed">
          <div className="stat-icon"><MdCheckCircle /></div>
          <div className="stat-content">
            <div className="stat-number">{stats.completed}</div>
            <div className="stat-label">Complétées</div>
          </div>
        </div>

        <div className="stat-card rate">
          <div className="stat-icon"><MdTrendingUp /></div>
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

        <div className="metric-card highlight">
          <h3>🎯 Taux de Recrutement</h3>
          <div className="metric-value">{stats.recruitmentRate}%</div>
          <div className="metric-detail">Entretiens / Candidatures</div>
        </div>
      </div>

      {/* SOURCES DE CANDIDATURES */}
      <div className="analysis-section">
        <div className="analysis-table full-width">
          <h3>📱 Candidatures par Source</h3>
          <table>
            <thead>
              <tr>
                <th>Source</th>
                <th>Candidatures</th>
                <th>Entretiens Réalisés</th>
                <th>Taux d'Efficacité</th>
              </tr>
            </thead>
            <tbody>
              {stats.sourceStats && stats.sourceStats.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.source}</td>
                  <td><strong>{item.candidatures}</strong></td>
                  <td>{item.entretiens}</td>
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <div style={{
                        width: '100px',
                        height: '6px',
                        backgroundColor: '#e0e0e0',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${Math.min(item.taux, 100)}%`,
                          height: '100%',
                          backgroundColor: item.taux >= 50 ? '#4CAF50' : item.taux >= 25 ? '#FFC107' : '#FF6B6B',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                      <span>{item.taux}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="analysis-table full-width">
          <h3>🏭 Par Pole (INSHORE/OFFSHORE/MANAGERS)</h3>
          <table>
            <thead>
              <tr>
                <th>Pole</th>
                <th>Demandes</th>
                <th>Postes</th>
                <th>Candidatures</th>
                <th>Entretiens</th>
                <th>Taux Recrutement</th>
                <th>Moy. Candidatures/Demande</th>
              </tr>
            </thead>
            <tbody>
              {stats.poleStats && stats.poleStats.map((item, idx) => (
                <tr key={idx}>
                  <td><strong>{item.pole}</strong></td>
                  <td>{item.requests}</td>
                  <td>{item.postes}</td>
                  <td>{item.candidatures}</td>
                  <td>{item.entretiens}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: item.recruitmentRate >= 50 ? '#d4edda' : '#fff3cd',
                      color: item.recruitmentRate >= 50 ? '#155724' : '#856404'
                    }}>
                      {item.recruitmentRate}%
                    </span>
                  </td>
                  <td>{item.avgCandidatures}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
        <h3>📋 Détails par Fonction {searchCode && `(${filteredRequests.length} résultats)`}</h3>
        <div className="functions-cards-grid">
          {filteredRequests.map((request, idx) => {
            const candidatureRate = request.numberToRecruit > 0 
              ? Math.round((request.totalCandidatures / request.numberToRecruit) * 100)
              : 0;
            const recruitRate = request.totalCandidatures > 0
              ? Math.round((request.interviewsConducted / request.totalCandidatures) * 100)
              : 0;
            const rateClass = getCandidatureRateClass(candidatureRate);
            
            // Compter les candidatures par source
            const sourceBreakdown = {};
            if (request.sourceData) {
              Object.entries(request.sourceData).forEach(([source, data]) => {
                sourceBreakdown[source] = data.candidatures || 0;
              });
            }
            
            return (
              <div key={idx} className={`function-card ${rateClass} ${request.closureDate ? 'completed' : 'inprogress'}`}>
                <div className="function-card-header">
                  <h4>🎯 {request.function}</h4>
                  {request.pole && <span className="function-card-pole">{request.pole}</span>}
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
                    <span className="function-card-label">📬 Total Candidatures:</span>
                    <span className="function-card-value" style={{fontWeight: 'bold', color: '#1976d2'}}>{request.totalCandidatures}</span>
                  </div>
                  <div className="function-card-row">
                    <span className="function-card-label">💬 Entretiens Réalisés:</span>
                    <span className="function-card-value">{request.interviewsConducted || 0}</span>
                  </div>
                  
                  {Object.keys(sourceBreakdown).length > 0 && (
                    <div className="function-card-sources">
                      <span className="function-card-label">📱 Sources:</span>
                      <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px'}}>
                        {Object.entries(sourceBreakdown).map(([source, count]) => (
                          count > 0 && (
                            <span key={source} style={{
                              padding: '2px 8px',
                              fontSize: '12px',
                              borderRadius: '12px',
                              backgroundColor: source === 'Facebook' ? '#E7F3FF' : 
                                             source === 'LinkedIn' ? '#E8F4FF' :
                                             source === 'Interne' ? '#E8F5E9' : '#FFF3E0',
                              color: source === 'Facebook' ? '#1877F2' :
                                    source === 'LinkedIn' ? '#0A66C2' :
                                    source === 'Interne' ? '#2E7D32' : '#E65100'
                            }}>
                              {source}: {count}
                            </span>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="function-card-footer">
                  <div style={{marginBottom: '8px'}}>
                    <span className="function-card-label">📊 Taux Candidatures:</span>
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
                  <div>
                    <span className="function-card-label">🎯 Taux Recrutement:</span>
                    <div className="function-card-rate">
                      <div className="rate-bar">
                        <div 
                          className="rate-fill" 
                          style={{ 
                            width: `${recruitRate}%`,
                            backgroundColor: recruitRate >= 40 ? '#4CAF50' : '#FFC107'
                          }}
                        ></div>
                      </div>
                      <span className="rate-percentage">{recruitRate}%</span>
                    </div>
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
