
export function getDurationDisplay(durationinSeconds: number) {
  const minutes = Math.floor(durationinSeconds / 60);
  const seconds = new String(durationinSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function generateRandomId(prefix = "", length = 8) {
    return `${prefix}-${Math.random().toString(36).substring(2, length)}`;
}