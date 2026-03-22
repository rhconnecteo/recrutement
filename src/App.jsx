import { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DashboardAnalytics from './pages/DashboardAnalytics';
import RecrutementForm from './pages/RecrutementForm';
import RequestDetails from './pages/RequestDetails';
import Rapport from './pages/Rapport';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  if (!user) {
    return <Login onLogin={(username) => setUser(username)} />;
  }

  const handleSelectRequest = (requestId) => {
    setSelectedRequestId(requestId);
    setCurrentPage('form');
  };

  const handleViewDetails = (requestId) => {
    setSelectedRequestId(requestId);
    setCurrentPage('details');
  };

  const handleEditFromDetails = (requestId) => {
    setSelectedRequestId(requestId);
    setCurrentPage('form');
  };

  const handleBackFromDetails = () => {
    setCurrentPage('dashboard');
    setSelectedRequestId(null);
  };

  const handleNewRequest = () => {
    setSelectedRequestId(null);
    setCurrentPage('form');
  };

  const handleSaveRequest = () => {
    setCurrentPage('dashboard');
    setSelectedRequestId(null);
  };

  const handleCancel = () => {
    setCurrentPage('dashboard');
    setSelectedRequestId(null);
  };

  return (
    <div className="app-container">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h1>📊 Recrutement</h1>
        </div>
        
        <ul className="sidebar-menu">
          <li>
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={currentPage === 'dashboard' ? 'sidebar-btn active' : 'sidebar-btn'}
            >
              <span className="icon">📋</span>
              <span>Dashboard</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => setCurrentPage('analytics')}
              className={currentPage === 'analytics' ? 'sidebar-btn active' : 'sidebar-btn'}
            >
              <span className="icon">📊</span>
              <span>Analytique</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => setCurrentPage('rapport')}
              className={currentPage === 'rapport' ? 'sidebar-btn active' : 'sidebar-btn'}
            >
              <span className="icon">📄</span>
              <span>Rapport</span>
            </button>
          </li>
          <li>
            <button
              onClick={handleNewRequest}
              className={currentPage === 'form' && !selectedRequestId ? 'sidebar-btn active' : 'sidebar-btn'}
            >
              <span className="icon">➕</span>
              <span>Nouvelle Demande</span>
            </button>
          </li>
          <li>
            <button
              disabled
              className="sidebar-btn disabled"
              style={{ cursor: 'default', opacity: 0.5 }}
            >
              <span className="icon">👤</span>
              <span>{user}</span>
            </button>
          </li>
          <li style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #444' }}>
            <button
              onClick={() => setUser(null)}
              className="sidebar-btn logout-btn"
            >
              <span className="icon">🚪</span>
              <span>Déconnexion</span>
            </button>
          </li>
        </ul>
      </nav>

      <div className="main-content">
        {currentPage === 'dashboard' && (
          <Dashboard
            onSelectRequest={handleSelectRequest}
            onViewDetails={handleViewDetails}
            onNewRequest={handleNewRequest}
          />
        )}

        {currentPage === 'analytics' && (
          <DashboardAnalytics />
        )}

        {currentPage === 'rapport' && (
          <Rapport />
        )}

        {currentPage === 'form' && (
          <RecrutementForm
            requestId={selectedRequestId}
            onSave={handleSaveRequest}
            onCancel={handleCancel}
          />
        )}

        {currentPage === 'details' && (
          <RequestDetails
            requestId={selectedRequestId}
            onEdit={handleEditFromDetails}
            onBack={handleBackFromDetails}
          />
        )}
      </div>
    </div>
  );
}