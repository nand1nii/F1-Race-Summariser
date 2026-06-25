import { timeToSeconds, secondsToLapTime, formatGap, driverName, driverSurname } from '../utils/formatters.js';

export function analyzeRace({ raceResult, qualifying, pitStops, laps, weather, stints }) {
  const analysis = {
    raceInfo: extractRaceInfo(raceResult),
    results: analyzeResults(raceResult),
    grid: analyzeGrid(raceResult, qualifying),
    overtakes: detectOvertakes(laps, pitStops, raceResult),
    pitStrategy: analyzePitStops(pitStops, raceResult, stints),
    lapAnalysis: analyzeLaps(laps, raceResult),
    retirements: findRetirements(raceResult),
    podium: analyzePodium(raceResult),
    weather: analyzeWeather(weather),
  };

  analysis.report = generateReport(analysis);
  return analysis;
}

function extractRaceInfo(raceResult) {
  if (!raceResult) return null;
  return {
    name: raceResult.raceName,
    circuit: raceResult.Circuit?.circuitName,
    location: `${raceResult.Circuit?.Location?.locality}, ${raceResult.Circuit?.Location?.country}`,
    date: raceResult.date,
    season: raceResult.season,
    round: raceResult.round,
  };
}

function analyzeResults(raceResult) {
  if (!raceResult?.Results) return [];
  return raceResult.Results.map(r => ({
    position: parseInt(r.position),
    driver: driverName(r.Driver),
    surname: driverSurname(r.Driver),
    constructor: r.Constructor.name,
    grid: parseInt(r.grid),
    positionsGained: parseInt(r.grid) - parseInt(r.position),
    time: r.Time?.time || null,
    status: r.status,
    points: parseFloat(r.points),
    fastestLap: r.FastestLap ? {
      rank: parseInt(r.FastestLap.rank),
      lap: parseInt(r.FastestLap.lap),
      time: r.FastestLap.Time?.time,
      avgSpeed: r.FastestLap.AverageSpeed?.speed,
    } : null,
  }));
}

function analyzeGrid(raceResult, qualifying) {
  if (!raceResult?.Results) return { bigMovers: [], poleSitter: null };

  const results = raceResult.Results;
  const poleSitter = results.find(r => parseInt(r.grid) === 1);
  const bigMovers = results
    .filter(r => r.status === 'Finished' || r.status?.includes('Lap'))
    .map(r => ({
      driver: driverName(r.Driver),
      surname: driverSurname(r.Driver),
      grid: parseInt(r.grid),
      finish: parseInt(r.position),
      gained: parseInt(r.grid) - parseInt(r.position),
    }))
    .filter(d => Math.abs(d.gained) >= 3)
    .sort((a, b) => b.gained - a.gained);

  return {
    poleSitter: poleSitter ? driverName(poleSitter.Driver) : null,
    bigMovers,
  };
}

function detectOvertakes(laps, pitStops, raceResult) {
  if (!laps || laps.length < 2) return [];

  const pitLaps = new Set();
  if (pitStops) {
    pitStops.forEach(ps => {
      const lap = parseInt(ps.lap);
      pitLaps.add(`${ps.driverId}_${lap}`);
      pitLaps.add(`${ps.driverId}_${lap + 1}`);
    });
  }

  const overtakes = [];

  for (let i = 1; i < laps.length; i++) {
    const prevLap = laps[i - 1];
    const currLap = laps[i];

    const prevPositions = {};
    prevLap.Timings?.forEach(t => {
      prevPositions[t.driverId] = parseInt(t.position);
    });

    currLap.Timings?.forEach(t => {
      const driverId = t.driverId;
      const currPos = parseInt(t.position);
      const prevPos = prevPositions[driverId];

      if (prevPos && currPos < prevPos) {
        const isPitRelated = pitLaps.has(`${driverId}_${parseInt(currLap.number)}`);
        const overtakenDrivers = currLap.Timings.filter(ot => {
          const otPrev = prevPositions[ot.driverId];
          return otPrev && otPrev === currPos && parseInt(ot.position) > otPrev;
        });
        const isPitByOther = overtakenDrivers.some(od =>
          pitLaps.has(`${od.driverId}_${parseInt(currLap.number)}`)
        );

        if (!isPitRelated && !isPitByOther) {
          overtakes.push({
            lap: parseInt(currLap.number),
            driverId,
            from: prevPos,
            to: currPos,
            positionsGained: prevPos - currPos,
          });
        }
      }
    });
  }

  if (raceResult?.Results) {
    const driverMap = {};
    raceResult.Results.forEach(r => {
      driverMap[r.Driver.driverId] = driverName(r.Driver);
    });
    overtakes.forEach(o => {
      o.driver = driverMap[o.driverId] || o.driverId;
    });
  }

  return overtakes;
}

function analyzePitStops(pitStops, raceResult, stints) {
  if (!pitStops || pitStops.length === 0) return { stops: [], medianDuration: null, slowStops: [] };

  const driverMap = {};
  if (raceResult?.Results) {
    raceResult.Results.forEach(r => {
      driverMap[r.Driver.driverId] = driverName(r.Driver);
    });
  }

  const stops = pitStops.map(ps => ({
    driverId: ps.driverId,
    driver: driverMap[ps.driverId] || ps.driverId,
    lap: parseInt(ps.lap),
    stop: parseInt(ps.stop),
    duration: parseFloat(ps.duration),
  }));

  const durations = stops.map(s => s.duration).sort((a, b) => a - b);
  const medianDuration = durations[Math.floor(durations.length / 2)];

  const slowStops = stops.filter(s => s.duration > medianDuration + 3);

  const strategyByDriver = {};
  stops.forEach(s => {
    if (!strategyByDriver[s.driverId]) {
      strategyByDriver[s.driverId] = { driver: s.driver, stops: [] };
    }
    strategyByDriver[s.driverId].stops.push(s);
  });

  if (stints && stints.length > 0) {
    stints.forEach(st => {
      const driverId = Object.keys(driverMap).find(id =>
        driverMap[id]?.includes(st.driver_number?.toString())
      );
      if (strategyByDriver[driverId || '']) {
        strategyByDriver[driverId].tyreCompounds = stints
          .filter(s => s.driver_number === st.driver_number)
          .map(s => s.compound);
      }
    });
  }

  return {
    stops,
    medianDuration,
    slowStops,
    strategies: Object.values(strategyByDriver),
  };
}

function analyzeLaps(laps, raceResult) {
  if (!laps || laps.length === 0) return { fastestLap: null, totalLaps: 0 };

  const totalLaps = laps.length;
  let fastestLap = null;
  let fastestTime = Infinity;

  const driverMap = {};
  if (raceResult?.Results) {
    raceResult.Results.forEach(r => {
      driverMap[r.Driver.driverId] = driverName(r.Driver);
    });
  }

  const driverLapTimes = {};

  laps.forEach(lap => {
    lap.Timings?.forEach(t => {
      const seconds = timeToSeconds(t.time);
      if (seconds && seconds < fastestTime && parseInt(lap.number) > 1) {
        fastestTime = seconds;
        fastestLap = {
          lap: parseInt(lap.number),
          driverId: t.driverId,
          driver: driverMap[t.driverId] || t.driverId,
          time: t.time,
          timeSeconds: seconds,
        };
      }

      if (!driverLapTimes[t.driverId]) {
        driverLapTimes[t.driverId] = [];
      }
      driverLapTimes[t.driverId].push({
        lap: parseInt(lap.number),
        time: seconds,
      });
    });
  });

  const consistency = {};
  Object.entries(driverLapTimes).forEach(([driverId, times]) => {
    const validTimes = times.map(t => t.time).filter(t => t && t < fastestTime * 1.15);
    if (validTimes.length > 5) {
      const avg = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
      const variance = validTimes.reduce((sum, t) => sum + (t - avg) ** 2, 0) / validTimes.length;
      consistency[driverId] = {
        driver: driverMap[driverId] || driverId,
        avgLapTime: secondsToLapTime(avg),
        avgLapTimeSeconds: avg,
        stdDev: Math.sqrt(variance).toFixed(3),
        lapCount: validTimes.length,
      };
    }
  });

  return {
    totalLaps,
    fastestLap,
    driverLapTimes,
    consistency,
  };
}

function findRetirements(raceResult) {
  if (!raceResult?.Results) return [];
  return raceResult.Results
    .filter(r => r.status !== 'Finished' && !r.status?.startsWith('+'))
    .map(r => ({
      driver: driverName(r.Driver),
      surname: driverSurname(r.Driver),
      constructor: r.Constructor.name,
      status: r.status,
      grid: parseInt(r.grid),
      lapsCompleted: parseInt(r.laps),
    }));
}

function analyzePodium(raceResult) {
  if (!raceResult?.Results) return [];
  return raceResult.Results.slice(0, 3).map(r => ({
    position: parseInt(r.position),
    driver: driverName(r.Driver),
    surname: driverSurname(r.Driver),
    constructor: r.Constructor.name,
    grid: parseInt(r.grid),
    time: r.Time?.time || r.status,
    points: parseFloat(r.points),
    fastestLap: r.FastestLap?.Time?.time || null,
  }));
}

function analyzeWeather(weather) {
  if (!weather || weather.length === 0) return null;

  const hadRain = weather.some(w => w.rainfall === true || w.rainfall === 1);
  const temps = weather.map(w => w.air_temperature).filter(Boolean);
  const trackTemps = weather.map(w => w.track_temperature).filter(Boolean);

  return {
    hadRain,
    airTempRange: temps.length > 0
      ? { min: Math.min(...temps), max: Math.max(...temps) }
      : null,
    trackTempRange: trackTemps.length > 0
      ? { min: Math.min(...trackTemps), max: Math.max(...trackTemps) }
      : null,
  };
}

function generateReport(analysis) {
  const { raceInfo, results, grid, overtakes, pitStrategy, lapAnalysis, retirements, podium, weather } = analysis;

  if (!raceInfo || results.length === 0) return 'Insufficient data to generate report.';

  const sections = [];

  sections.push(`# ${raceInfo.name} ${raceInfo.season} — Race Report`);
  sections.push(`**${raceInfo.circuit}** | ${raceInfo.location} | ${raceInfo.date}`);
  sections.push('');

  const winner = results[0];
  sections.push(`## Race Overview`);
  sections.push(
    `${winner.driver} claimed victory at the ${raceInfo.name}, ` +
    `crossing the line ${winner.time ? `with a winning margin of ${winner.time}` : 'to take the chequered flag'}. ` +
    `Starting from P${winner.grid}, ${winner.surname} ` +
    `${winner.grid === 1 ? 'converted pole position into a race win' : `gained ${winner.positionsGained} position${winner.positionsGained !== 1 ? 's' : ''} from the grid`} ` +
    `for ${winner.constructor}.`
  );
  sections.push('');

  sections.push(`## Race Start and Opening Laps`);
  const poleSitter = grid.poleSitter;
  if (poleSitter) {
    sections.push(`${poleSitter} lined up on pole position.`);
  }
  if (grid.bigMovers.length > 0) {
    const gainers = grid.bigMovers.filter(m => m.gained > 0).slice(0, 3);
    const losers = grid.bigMovers.filter(m => m.gained < 0).slice(0, 3);
    if (gainers.length > 0) {
      sections.push(
        'The biggest movers through the field were ' +
        gainers.map(m => `${m.driver} (P${m.grid} to P${m.finish}, +${m.gained})`).join(', ') + '.'
      );
    }
    if (losers.length > 0) {
      sections.push(
        'Notable fallers included ' +
        losers.map(m => `${m.driver} (P${m.grid} to P${m.finish}, ${m.gained})`).join(', ') + '.'
      );
    }
  }
  sections.push('');

  if (overtakes.length > 0) {
    sections.push(`## Notable Overtakes`);
    sections.push(`A total of ${overtakes.length} on-track overtakes were detected during the race.`);
    const topOvertakes = overtakes
      .sort((a, b) => b.positionsGained - a.positionsGained || a.lap - b.lap)
      .slice(0, 10);
    topOvertakes.forEach(o => {
      sections.push(
        `- **Lap ${o.lap}**: ${o.driver} moved from P${o.from} to P${o.to} (+${o.positionsGained})`
      );
    });
    sections.push('');
  }

  if (pitStrategy.stops.length > 0) {
    sections.push(`## Pit Stop Strategy`);
    sections.push(`The median pit stop duration was ${pitStrategy.medianDuration?.toFixed(1)} seconds.`);

    if (pitStrategy.strategies?.length > 0) {
      const oneStop = pitStrategy.strategies.filter(s => s.stops.length === 1);
      const twoStop = pitStrategy.strategies.filter(s => s.stops.length === 2);
      const threeStop = pitStrategy.strategies.filter(s => s.stops.length >= 3);

      if (oneStop.length > 0) sections.push(`${oneStop.length} driver(s) ran a one-stop strategy.`);
      if (twoStop.length > 0) sections.push(`${twoStop.length} driver(s) opted for two stops.`);
      if (threeStop.length > 0) sections.push(`${threeStop.length} driver(s) made three or more stops.`);
    }

    if (pitStrategy.slowStops.length > 0) {
      sections.push('\n**Slow stops** (3+ seconds above median):');
      pitStrategy.slowStops.forEach(s => {
        sections.push(`- ${s.driver}: ${s.duration.toFixed(1)}s on lap ${s.lap} (stop ${s.stop})`);
      });
    }
    sections.push('');
  }

  if (weather) {
    sections.push(`## Conditions`);
    const parts = [];
    if (weather.hadRain) {
      parts.push('Rain fell during the race, adding a strategic variable.');
    } else {
      parts.push('The race ran in dry conditions.');
    }
    if (weather.airTempRange) {
      parts.push(`Air temperature ranged from ${weather.airTempRange.min.toFixed(1)}°C to ${weather.airTempRange.max.toFixed(1)}°C.`);
    }
    if (weather.trackTempRange) {
      parts.push(`Track temperature ranged from ${weather.trackTempRange.min.toFixed(1)}°C to ${weather.trackTempRange.max.toFixed(1)}°C.`);
    }
    sections.push(parts.join(' '));
    sections.push('');
  }

  if (retirements.length > 0) {
    sections.push(`## Retirements`);
    retirements.forEach(r => {
      sections.push(
        `- **${r.driver}** (${r.constructor}): ${r.status} after ${r.lapsCompleted} lap${r.lapsCompleted !== 1 ? 's' : ''} (started P${r.grid})`
      );
    });
    sections.push('');
  }

  if (lapAnalysis.fastestLap) {
    sections.push(`## Fastest Lap`);
    sections.push(
      `${lapAnalysis.fastestLap.driver} set the fastest lap of the race on lap ${lapAnalysis.fastestLap.lap} ` +
      `with a time of ${lapAnalysis.fastestLap.time}.`
    );
    sections.push('');
  }

  sections.push(`## Podium`);
  podium.forEach(p => {
    sections.push(
      `${p.position}. **${p.driver}** (${p.constructor}) — ` +
      `${p.position === 1 ? (p.time || 'Winner') : p.time} | Started P${p.grid} | ${p.points} pts`
    );
  });
  sections.push('');

  sections.push(`## Full Classification`);
  sections.push('| Pos | Driver | Constructor | Grid | Status | Points |');
  sections.push('|-----|--------|-------------|------|--------|--------|');
  results.forEach(r => {
    sections.push(
      `| ${r.position} | ${r.driver} | ${r.constructor} | P${r.grid} | ${r.time || r.status} | ${r.points} |`
    );
  });

  return sections.join('\n');
}
