/**
 * Validate email address
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password (minimum 8 characters, at least one letter and one number)
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
};

/**
 * Get password strength
 */
export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  if (password.length < 8) return 'weak';

  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);

  const score =
    (hasLetter ? 1 : 0) +
    (hasNumber ? 1 : 0) +
    (hasSpecialChar ? 1 : 0) +
    (hasUpperCase ? 1 : 0) +
    (hasLowerCase ? 1 : 0);

  if (score >= 4) return 'strong';
  if (score >= 3) return 'medium';
  return 'weak';
};

/**
 * Validate URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate date (not in past)
 */
export const isValidFutureDate = (date: string): boolean => {
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate >= today;
};

/**
 * Validate date range
 */
export const isValidDateRange = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return end > start;
};

/**
 * Validate phone number (basic)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[\d\s()-]{10,}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate required field
 */
export const isRequired = (value: any): boolean => {
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return !isNaN(value);
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && value !== undefined;
};

/**
 * Validate min length
 */
export const minLength = (value: string, min: number): boolean => {
  return value.length >= min;
};

/**
 * Validate max length
 */
export const maxLength = (value: string, max: number): boolean => {
  return value.length <= max;
};

/**
 * Validate number range
 */
export const inRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};
