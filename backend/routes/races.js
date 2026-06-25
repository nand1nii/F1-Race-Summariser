import { Router } from 'express';
import {
  getSeasons,
  getRacesInSeason,
  getRaceResults,
  getQualifyingResults,
  getPitStops,
  getLapTimes,
  getOpenF1Sessions,
  getOpenF1Weather,
  getOpenF1Stints,
} from '../services/f1Api.js';
import { analyzeRace } from '../services/analyzer.js';

const router = Router();

router.get('/seasons', async (req, res) => {
  try {
    const seasons = await getSeasons();
    res.json(seasons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/seasons/:year/races', async (req, res) => {
  try {
    const races = await getRacesInSeason(req.params.year);
    res.json(races);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/races/:year/:round/analysis', async (req, res) => {
  const { year, round } = req.params;

  try {
    const [raceResult, qualifying, pitStops, laps] = await Promise.all([
      getRaceResults(year, round),
      getQualifyingResults(year, round).catch(() => []),
      getPitStops(year, round).catch(() => []),
      getLapTimes(year, round).catch(() => []),
    ]);

    let weather = [];
    let stints = [];

    const yearNum = parseInt(year);
    if (yearNum >= 2023) {
      try {
        const sessions = await getOpenF1Sessions(year);
        const raceDate = raceResult?.date;
        const session = sessions.find(s => s.date_start?.startsWith(raceDate));
        if (session) {
          [weather, stints] = await Promise.all([
            getOpenF1Weather(session.session_key).catch(() => []),
            getOpenF1Stints(session.session_key).catch(() => []),
          ]);
        }
      } catch {
        // OpenF1 data is supplementary
      }
    }

    const analysis = analyzeRace({ raceResult, qualifying, pitStops, laps, weather, stints });
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
