export default function Dashboard({ analysis }) {
  if (!analysis) return null;

  const { results, overtakes, pitStrategy, lapAnalysis, retirements } = analysis;

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <StatCard label="Total Laps" value={lapAnalysis?.totalLaps || '—'} />
        <StatCard label="Finishers" value={results.filter(r => r.status === 'Finished' || r.time).length} />
        <StatCard label="Retirements" value={retirements.length} />
        <StatCard label="On-Track Overtakes" value={overtakes.length} />
        <StatCard label="Total Pit Stops" value={pitStrategy?.stops?.length || 0} />
        <StatCard
          label="Fastest Lap"
          value={lapAnalysis?.fastestLap?.time || '—'}
          subtitle={lapAnalysis?.fastestLap?.driver}
        />
      </div>

      {results.length > 0 && (
        <div className="dashboard-section">
          <h3>Positions Gained/Lost from Grid</h3>
          <div className="position-chart">
            {results.slice(0, 20).map(r => (
              <div key={r.driver} className="position-bar-row">
                <span className="position-label">P{r.position} {r.surname}</span>
                <div className="position-bar-container">
                  <div
                    className={`position-bar ${r.positionsGained > 0 ? 'gain' : r.positionsGained < 0 ? 'loss' : 'neutral'}`}
                    style={{ width: `${Math.min(Math.abs(r.positionsGained) * 12, 100)}%` }}
                  >
                    <span className="position-bar-value">
                      {r.positionsGained > 0 ? `+${r.positionsGained}` : r.positionsGained}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pitStrategy?.stops?.length > 0 && (
        <div className="dashboard-section">
          <h3>Pit Stop Durations</h3>
          <div className="pit-stop-chart">
            {pitStrategy.strategies?.slice(0, 15).map(s => (
              <div key={s.driver} className="pit-row">
                <span className="pit-driver">{s.driver}</span>
                <div className="pit-stops-visual">
                  {s.stops.map((stop, i) => (
                    <span
                      key={i}
                      className={`pit-dot ${stop.duration > (pitStrategy.medianDuration + 3) ? 'slow' : ''}`}
                      title={`Stop ${stop.stop}: Lap ${stop.lap} — ${stop.duration.toFixed(1)}s`}
                    >
                      {stop.duration.toFixed(1)}s
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, subtitle }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {subtitle && <div className="stat-subtitle">{subtitle}</div>}
    </div>
  );
}
