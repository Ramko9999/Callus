export const Period = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 1000 * 60 * 60 * 24,
};

export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];

const MONTH_TO_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const MINUTES = Array.from({ length: 60 }, (_, index) => index);

export const HOURS = Array.from({ length: 12 }, (_, index) => index);

export const AM_OR_PM = ["AM", "PM"];

export type Duration = {
  hours: number;
  minutes: number;
  seconds: number;
};

function getDaysInMonth(month: number, year: number) {
  if (month === 1) {
    if (year % 4 === 0) {
      return MONTH_TO_DAYS[month] + 1;
    }
  }
  return MONTH_TO_DAYS[month];
}

// todo: dry
export function getDuration(durationInMillis: number): Duration {
  const seconds = Math.floor(durationInMillis / Period.SECOND) % 60;
  const minutes = Math.floor(durationInMillis / Period.MINUTE) % 60;
  const hours = Math.floor(durationInMillis / Period.HOUR);

  return { hours, minutes, seconds };
}

export function getDaysBetween(from: number, to: number): number {
  return Math.ceil((to - from) / Period.DAY);
}

export function getDurationDisplay(durationinSeconds: number) {
  const minutes = Math.floor(durationinSeconds / 60);
  const seconds = new String(durationinSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function roundToNearestMinute(durationInMillis: number) {
  const millis = durationInMillis % 60_000;
  if (millis > 0) {
    return durationInMillis + (60_000 - millis);
  }
  return durationInMillis;
}

export function getTrendDatePeriod(from: Date, to: Date) {
  const days = getDaysBetween(from.valueOf(), to.valueOf());
  if (days >= 60) {
    return "3 months";
  } else if (days >= 30) {
    return "2 months";
  } else if (days >= 14) {
    return "1 month";
  } else {
    return "2 weeks";
  }
}

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
  const date = new Date(timestamp);
  date.setDate(date.getDate() + days);
  return date.valueOf();
}

export function removeDays(timestamp: number, days: number) {
  return addDays(timestamp, -1 * days);
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
  switch (day) {
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
  let month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(date);

  let formatted = `${month} ${date.getDate()}${getDateSuffix(date.getDate())}`;
  if (withTime) {
    formatted = `${month} ${date.getDate()}${getDateSuffix(
      date.getDate()
    )} ${getHour(timestamp)}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")} ${getAmOrPm(timestamp)}`;
  }

  if (date.getFullYear() !== new Date().getFullYear()) {
    formatted = `${formatted}, ${date.getFullYear()}`;
  }
  return formatted;
}

export function getTimeDisplay(timestamp: number) {
  const date = new Date(timestamp);
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`;
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

export function getRouletteDateDisplay(timestamp: number) {
  const date = new Date(timestamp);
  return [
    DAYS_OF_WEEK[date.getDay()],
    MONTHS[date.getMonth()],
    date.getDate(),
    date.getFullYear(),
  ].join(" ");
}

export function generateDateRange(inclusiveFrom: number, days: number) {
  let dateMod = days < 0 ? removeDays : addDays;
  return Array.from({ length: Math.abs(days) }, (_, index) =>
    dateMod(inclusiveFrom, index)
  ).sort();
}

export function getAmOrPm(timestamp: number) {
  return new Date(timestamp).getHours() >= 12 ? "PM" : "AM";
}

export function getHour(timestamp: number) {
  const date = new Date(timestamp);
  return date.getHours() % 12 === 0 ? 12 : date.getHours() % 12;
}

export function getDateEditDisplay(timestamp: number) {
  const date = new Date(timestamp);
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${getRouletteDateDisplay(timestamp)}, ${getHour(
    timestamp
  )}:${minutes} ${getAmOrPm(timestamp)}`;
}

export function generateEnclosingWeek(timestamp: number) {
  const date = new Date(timestamp);
  let week = [];
  for (let i = 0; i < 7; i++) {
    week.push(addDays(timestamp, i - date.getDay()));
  }
  return week;
}

export function generateEnclosingMonth(timestamp: number) {
  const date = new Date(timestamp);
  const month = date.getMonth();
  const firstDay = new Date(date.getFullYear(), month, 1, 0, 0, 0, 0);

  const weeks = [];
  for (
    let week = generateEnclosingWeek(firstDay.valueOf());
    week.some((date) => new Date(date).getMonth() === month);
    week = generateEnclosingWeek(addDays(week[6], 1))
  ) {
    weeks.push([...week]);
  }
  return weeks;
}

export function getPreviousMonth(timestamp: number) {
  const date = new Date(timestamp);
  date.setDate(0);
  return date.valueOf();
}

export function getNextMonth(timestamp: number) {
  const date = new Date(timestamp);
  date.setDate(getDaysInMonth(date.getMonth(), date.getFullYear()) + 1);
  return date.valueOf();
}

export function getMonthFirstDay(timestamp: number) {
  const lastMonthLastDay = new Date(getPreviousMonth(timestamp));
  lastMonthLastDay.setDate(lastMonthLastDay.getDate() + 1);
  return lastMonthLastDay.valueOf();
}

export function goBackMonths(timestamp: number, monthsToGoBack: number) {
  let newTimestamp = timestamp;
  for (let i = 0; i < monthsToGoBack; i++) {
    newTimestamp = getPreviousMonth(newTimestamp);
  }
  return newTimestamp;
}
