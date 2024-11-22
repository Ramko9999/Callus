export function generateRandomId(prefix = "", length = 8) {
    return `${prefix}-${Math.random().toString(36).substring(2, length)}`;
  }
  