export function normalizePhone(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPhone(value: string) {
  const compact = value.replace(/[^\d+]/g, "");
  return /^(\+?\d{9,15})$/.test(compact);
}

export function isValidBirthDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return date <= now;
}
