const ERGAST_BASE = 'https://api.jolpi.ca/ergast/f1';
const OPENF1_BASE = 'https://api.openf1.org/v1';

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

export async function getSeasons() {
  const data = await fetchJson(`${ERGAST_BASE}/seasons.json?limit=80`);
  return data.MRData.SeasonTable.Seasons.reverse();
}

export async function getRacesInSeason(year) {
  const data = await fetchJson(`${ERGAST_BASE}/${year}.json`);
  return data.MRData.RaceTable.Races;
}

export async function getRaceResults(year, round) {
  const data = await fetchJson(`${ERGAST_BASE}/${year}/${round}/results.json`);
  return data.MRData.RaceTable.Races[0] || null;
}

export async function getQualifyingResults(year, round) {
  const data = await fetchJson(`${ERGAST_BASE}/${year}/${round}/qualifying.json`);
  const race = data.MRData.RaceTable.Races[0];
  return race ? race.QualifyingResults : [];
}

export async function getPitStops(year, round) {
  const data = await fetchJson(`${ERGAST_BASE}/${year}/${round}/pitstops.json?limit=100`);
  const race = data.MRData.RaceTable.Races[0];
  return race ? race.PitStops : [];
}

export async function getLapTimes(year, round) {
  const allLaps = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const data = await fetchJson(
      `${ERGAST_BASE}/${year}/${round}/laps.json?limit=${limit}&offset=${offset}`
    );
    const race = data.MRData.RaceTable.Races[0];
    if (!race || !race.Laps || race.Laps.length === 0) break;
    allLaps.push(...race.Laps);
    const total = parseInt(data.MRData.total);
    offset += limit;
    if (offset >= total) break;
  }

  return allLaps;
}

export async function getDriverStandings(year) {
  const data = await fetchJson(`${ERGAST_BASE}/${year}/driverStandings.json`);
  const list = data.MRData.StandingsTable.StandingsLists[0];
  return list ? list.DriverStandings : [];
}

export async function getOpenF1Sessions(year) {
  try {
    const data = await fetchJson(`${OPENF1_BASE}/sessions?year=${year}&session_type=Race`);
    return data;
  } catch {
    return [];
  }
}

export async function getOpenF1Weather(sessionKey) {
  try {
    const data = await fetchJson(`${OPENF1_BASE}/weather?session_key=${sessionKey}`);
    return data;
  } catch {
    return [];
  }
}

export async function getOpenF1Intervals(sessionKey) {
  try {
    const data = await fetchJson(`${OPENF1_BASE}/intervals?session_key=${sessionKey}`);
    return data;
  } catch {
    return [];
  }
}

export async function getOpenF1Stints(sessionKey) {
  try {
    const data = await fetchJson(`${OPENF1_BASE}/stints?session_key=${sessionKey}`);
    return data;
  } catch {
    return [];
  }
}
