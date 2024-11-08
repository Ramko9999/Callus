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
  DAY: 1000 * 60 * 60 * 24,
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

export function getHumanReadableDateDisplay(timestamp: number) {
  const todayTimestamp = truncTime(Date.now());
  if (truncTime(timestamp) === todayTimestamp) {
    return "Today";
  } else if (removeDays(todayTimestamp, 1) === truncTime(timestamp)) {
    return "Yesterday";
  } else {
    return getDateDisplay(timestamp);
  }
}

export function getDateDisplay(timestamp: number) {
  const date = new Date(truncTime(timestamp));
  const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(
    date
  );
  return `${month}. ${date.getDate()}`;
}

function getDateSuffix(day: number) {
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

export function getLongDateDisplay(
  timestamp: number,
  withTime: boolean = false
) {
  const date = new Date(timestamp);
  const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(
    date
  );
  if (withTime) {
    let hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
    let isAM = date.getHours() < 12 ? "AM" : "PM";
    return `${month} ${date.getDate()}${getDateSuffix(
      date.getDate()
    )} ${hours}:${date.getMinutes().toString().padStart(2, "0")} ${isAM}`;
  }
  return `${month} ${date.getDate()}${getDateSuffix(date.getDate())}`;
}

export function getTimeDisplay(timestamp: number) {
  const date = new Date(timestamp);
  return `${date.getHours()}:${date.getMinutes()}`;
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

export function usingDateOf(t1: number, t2: number) {
  const d1 = new Date(t1);
  const d2 = new Date(t2);

  d1.setDate(d2.getDate());
  d1.setFullYear(d2.getFullYear());
  d1.setMonth(d2.getMonth());
  return d1.valueOf();
}

export function usingTimeOf(t1: number, t2: number) {
  return usingDateOf(t2, t1);
}
