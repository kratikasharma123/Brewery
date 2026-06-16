export const NAME_PATTERN = '[A-Za-z ]+';
export const NAME_VALIDATION_MESSAGE = 'Please enter letters and spaces only';

export const sanitizeNameInput = (value) => value.replace(/[^A-Za-z ]/g, '');
