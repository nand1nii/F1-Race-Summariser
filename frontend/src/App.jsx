import { useState } from 'react';
import RaceSelector from './components/RaceSelector';
import Dashboard from './components/Dashboard';
import RaceReport from './components/RaceReport';
import { fetchAnalysis } from './services/api';

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [raceName, setRaceName] = useState('');
  const [activeTab, setActiveTab] = useState('report');

  const handleSelectRace = async (year, round, name) => {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setRaceName(name);
    try {
      const data = await fetchAnalysis(year, round);
      setAnalysis(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-f1">F1</span>
            <span className="logo-text">Race Analyzer</span>
          </div>
          <p className="tagline">Real-time race data analysis and reporting</p>
        </div>
      </header>

      <main className="app-main">
        <RaceSelector onSelectRace={handleSelectRace} />

        {loading && (
          <div className="loading">
            <div className="spinner" />
            <p>Fetching race data and generating analysis...</p>
            <p className="loading-sub">This may take a moment for races with full lap data</p>
          </div>
        )}

        {error && (
          <div className="error-banner">
            <p>Failed to analyze race: {error}</p>
          </div>
        )}

        {analysis && (
          <>
            <div className="tab-bar">
              <button
                className={`tab ${activeTab === 'report' ? 'active' : ''}`}
                onClick={() => setActiveTab('report')}
              >
                Race Report
              </button>
              <button
                className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard
              </button>
            </div>

            {activeTab === 'report' && <RaceReport report={analysis.report} />}
            {activeTab === 'dashboard' && <Dashboard analysis={analysis} />}
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>Data sourced from Jolpica F1 API and OpenF1</p>
      </footer>
    </div>
  );
}

export default App;
