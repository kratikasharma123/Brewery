export const DIGITS_PATTERN = '[0-9]+';
export const DIGITS_VALIDATION_MESSAGE = 'Please enter numbers only';

export const sanitizeDigitsInput = (value) => String(value || '').replace(/\D/g, '');

export const sanitizeDecimalInput = (value) => {
  const cleaned = String(value || '').replace(/[^0-9.]/g, '');
  const [whole, ...decimalParts] = cleaned.split('.');
  return decimalParts.length > 0 ? `${whole}.${decimalParts.join('')}` : whole;
};
