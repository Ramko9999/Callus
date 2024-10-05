

export function getDurationDisplay(durationinSeconds: number) {
  const minutes = Math.floor(durationinSeconds / 60);
  const seconds = new String(durationinSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function generateRandomId(prefix = "", length = 8) {
    return `${prefix}-${Math.random().toString(36).substring(2, length)}`;
}

export const Period = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 1000 * 60 * 60 * 24
};

export function truncTime(timestamp: number) {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.valueOf();
}

export function truncTimeUtc(timestamp: number) {
  const date = new Date(timestamp);
  date.setUTCHours(0, 0, 0, 0);
  return date.valueOf();
}

export function addDays(timestamp: number, days: number) {
  return timestamp + days * Period.DAY;
}

export function removeDays(timestamp: number, days: number) {
  return timestamp - days * Period.DAY;
}

export function getDateDisplay(timestamp: number) {
  const todayTimestamp = truncTime(Date.now())
  if(truncTime(timestamp) === todayTimestamp){
    return "Today"
  }
  else if(removeDays(todayTimestamp, 1) === truncTime(timestamp)){
    return "Yesterday"
  } else {
    const date = new Date(truncTime(timestamp))
    const month = new Intl.DateTimeFormat("en-US", { month: 'short' }).format(date);
    return `${month}. ${date.getDate()}`
  }
}

export function getTimePeriodDisplay(period: number) {
  const secs = Math.floor(period / Period.SECOND) % 60;
  const mins = Math.floor(period / Period.MINUTE) % 60;
  const hours = Math.floor(period / Period.HOUR);

  let builder = [];
  if (hours > 0) {
    builder.push(`${hours}h`);
  }
  if (mins > 0) {
    builder.push(`${mins}m`);
  }
  if (secs > 0) {
    builder.push(`${secs}s`);
  }
  return builder.join(" ");
}
