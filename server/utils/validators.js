export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());

export const isPersonName = (value) => /^[A-Za-z ]+$/.test(String(value || '').trim());

export const isObjectId = (value) => /^[0-9a-fA-F]{24}$/.test(String(value || ''));

export const cleanString = (value) => String(value || '').trim();

export const requireFields = (body, fields) => {
  const missing = fields.filter((field) => body[field] === undefined || body[field] === null || body[field] === '');
  if (missing.length > 0) {
    const error = new Error(`Missing required field(s): ${missing.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }
};

export const validateNumber = (value, field, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) {
    const error = new Error(`${field} must be a number between ${min} and ${max}`);
    error.statusCode = 400;
    throw error;
  }
  return number;
};

export const validateEnum = (value, field, allowed) => {
  if (!allowed.includes(value)) {
    const error = new Error(`${field} must be one of: ${allowed.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }
};
