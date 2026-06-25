export function timeToSeconds(timeStr) {
  if (!timeStr) return null;
  const parts = timeStr.split(':');
  if (parts.length === 2) {
    return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
  }
  return parseFloat(timeStr);
}

export function secondsToLapTime(seconds) {
  if (seconds == null) return 'N/A';
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(3);
  return `${mins}:${secs.padStart(6, '0')}`;
}

export function formatGap(seconds) {
  if (seconds == null) return 'N/A';
  return `+${seconds.toFixed(2)}s`;
}

export function driverName(driver) {
  return `${driver.givenName} ${driver.familyName}`;
}

export function driverSurname(driver) {
  return driver.familyName;
}
