const API_BASE =
  `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

export async function fetchSeasons() {
  const res = await fetch(`${API_BASE}/seasons`);
  if (!res.ok) throw new Error('Failed to fetch seasons');
  return res.json();
}

export async function fetchRaces(year) {
  const res = await fetch(`${API_BASE}/seasons/${year}/races`);
  if (!res.ok) throw new Error('Failed to fetch races');
  return res.json();
}

export async function fetchAnalysis(year, round) {
  const res = await fetch(`${API_BASE}/races/${year}/${round}/analysis`);
  if (!res.ok) throw new Error('Failed to fetch analysis');
  return res.json();
}
