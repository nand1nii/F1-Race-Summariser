import { useState, useEffect } from 'react';
import { fetchSeasons, fetchRaces } from '../services/api';

export default function RaceSelector({ onSelectRace }) {
  const [seasons, setSeasons] = useState([]);
  const [races, setRaces] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedRound, setSelectedRound] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSeasons()
      .then(data => {
        setSeasons(data);
        if (data.length > 0) setSelectedYear(data[0].season);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedYear) return;
    setLoading(true);
    setRaces([]);
    setSelectedRound('');
    fetchRaces(selectedYear)
      .then(data => {
        setRaces(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedYear]);

  const handleAnalyze = () => {
    if (selectedYear && selectedRound) {
      const race = races.find(r => r.round === selectedRound);
      onSelectRace(selectedYear, selectedRound, race?.raceName || '');
    }
  };

  return (
    <div className="race-selector">
      <div className="selector-row">
        <div className="selector-group">
          <label htmlFor="season-select">Season</label>
          <select
            id="season-select"
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
          >
            <option value="">Select season</option>
            {seasons.map(s => (
              <option key={s.season} value={s.season}>{s.season}</option>
            ))}
          </select>
        </div>

        <div className="selector-group">
          <label htmlFor="race-select">Race</label>
          <select
            id="race-select"
            value={selectedRound}
            onChange={e => setSelectedRound(e.target.value)}
            disabled={!selectedYear || loading}
          >
            <option value="">{loading ? 'Loading races...' : 'Select race'}</option>
            {races.map(r => (
              <option key={r.round} value={r.round}>
                R{r.round} — {r.raceName}
              </option>
            ))}
          </select>
        </div>

        <button
          className="analyze-btn"
          onClick={handleAnalyze}
          disabled={!selectedYear || !selectedRound}
        >
          Analyze Race
        </button>
      </div>
    </div>
  );
}
