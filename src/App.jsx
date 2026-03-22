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
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
      <nav className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <img src="/connecteo.png" alt="Connecteo" className="connecteo-logo" />
          <div className="sidebar-header-content">
            <img src="/logo2.svg" alt="Logo Recrutement" className="sidebar-logo" />
            <h1>Recrutement</h1>
            <button 
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? 'Réduire' : 'Agrandir'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        
        <ul className="sidebar-menu">
          <li>
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={currentPage === 'dashboard' ? 'sidebar-btn active' : 'sidebar-btn'}
              title="Dashboard"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span>Dashboard</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => setCurrentPage('analytics')}
              className={currentPage === 'analytics' ? 'sidebar-btn active' : 'sidebar-btn'}
              title="Analytique"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="2" x2="12" y2="22"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              <span>Analytique</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => setCurrentPage('rapport')}
              className={currentPage === 'rapport' ? 'sidebar-btn active' : 'sidebar-btn'}
              title="Rapport"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="13" x2="12" y2="17"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
              <span>Rapport</span>
            </button>
          </li>
          <li>
            <button
              onClick={handleNewRequest}
              className={currentPage === 'form' && !selectedRequestId ? 'sidebar-btn active' : 'sidebar-btn'}
              title="Nouvelle Demande"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Nouvelle Demande</span>
            </button>
          </li>
          <li style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="sidebar-btn disabled user-info" title={user}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>{user}</span>
            </div>
          </li>
          <li>
            <button
              onClick={() => setUser(null)}
              className="sidebar-btn logout-btn"
              title="Déconnexion"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
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