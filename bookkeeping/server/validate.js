// Small validation helpers. Every write endpoint runs its input through these
// so the API stays trustworthy even if a request bypasses the browser forms.

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
  }
}

export function requiredText(value, label, maxLength = 500) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) throw new ValidationError(`${label} is required.`);
  if (text.length > maxLength) {
    throw new ValidationError(`${label} must be ${maxLength} characters or fewer.`);
  }
  return text;
}

export function optionalText(value, label, maxLength = 500) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  if (!text) return null;
  if (text.length > maxLength) {
    throw new ValidationError(`${label} must be ${maxLength} characters or fewer.`);
  }
  return text;
}

export function isoDate(value, label) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    throw new ValidationError(`${label} must be a valid date.`);
  }
  const [year, month, day] = text.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new ValidationError(`${label} must be a valid date.`);
  }
  return text;
}

export function positiveAmount(value, label = 'Amount') {
  const amount = typeof value === 'number' ? value : Number(String(value ?? '').trim());
  if (!Number.isFinite(amount)) throw new ValidationError(`${label} must be a number.`);
  if (amount <= 0) throw new ValidationError(`${label} must be greater than zero.`);
  if (amount > 1_000_000_000) throw new ValidationError(`${label} is too large.`);
  return Math.round(amount * 100) / 100;
}

export function optionalEmail(value, label = 'Email') {
  const text = optionalText(value, label, 200);
  if (text && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
    throw new ValidationError(`${label} must be a valid email address.`);
  }
  return text;
}

export function intId(value, label = 'Id') {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new ValidationError(`${label} is not valid.`);
  return id;
}
