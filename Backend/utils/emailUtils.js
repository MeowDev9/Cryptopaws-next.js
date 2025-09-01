const User = require('../models/User');
const WelfareOrganization = require('../models/WelfareOrganization');
const Doctor = require('../models/Doctor');

// Regular expression for basic email validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INVALID_EMAILS = ['admin', 'root', 'user', 'test', 'support', 'info', 'contact'];
// List of admin emails that should not be used for other roles
const ADMIN_EMAILS = ['syedhb9@gmail.com'];

/**
 * Validates the format of an email address
 * @param {string} email - The email to validate
 * @returns {{isValid: boolean, message: string|null}} - Object indicating if the email is valid and an error message if not
 */
function validateEmailFormat(email) {
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }

  const normalizedEmail = email.toLowerCase().trim();
  
  // Check for empty email after trimming
  if (!normalizedEmail) {
    return { isValid: false, message: 'Email cannot be empty' };
  }

  // Check for common invalid email values
  if (INVALID_EMAILS.includes(normalizedEmail.split('@')[0])) {
    return { isValid: false, message: 'Please provide a valid email address' };
  }

  // Check email format with regex
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }

  return { isValid: true, message: null };
}

/**
 * Checks if an email is already in use across all user collections
 * @param {string} email - The email to check
 * @returns {Promise<{isUsed: boolean, userType: string|null, message: string|null}>} - Object with usage info and validation messages
 */
async function isEmailInUse(email) {
  // First validate email format
  const { isValid, message } = validateEmailFormat(email);
  if (!isValid) {
    return { isUsed: false, userType: null, message };
  }
  
  const normalizedEmail = email.toLowerCase().trim();
  
  // Check in User collection (donors, welfare, admin)
  const user = await User.findOne({ email: normalizedEmail });
  if (user) {
    return { isUsed: true, userType: user.role, message: 'This email is already registered. Please use a different email address.' };
  }
  
  // Check in WelfareOrganization collection
  const welfareOrg = await WelfareOrganization.findOne({ email: normalizedEmail });
  if (welfareOrg) {
    return { isUsed: true, userType: 'welfare', message: 'This email is already registered. Please use a different email address.' };
  }
  
  // Check in Doctor collection
  const doctor = await Doctor.findOne({ email: normalizedEmail });
  if (doctor) {
    return { isUsed: true, userType: 'doctor', message: 'This email is already registered. Please use a different email address.' };
  }
  
  return { isUsed: false, userType: null, message: null };
}

/**
 * Validates an email address format and checks if it's already in use
 * @param {string} email - The email to validate
 * @returns {Promise<{isValid: boolean, isUsed: boolean, userType: string|null, message: string}>} - Validation and usage result
 */
async function validateEmail(email, options = {}) {
  const { isAdminCheck = true } = options;
  
  // First validate the format
  const formatValidation = validateEmailFormat(email);
  if (!formatValidation.isValid) {
    return {
      isValid: false,
      isUsed: false,
      userType: null,
      message: formatValidation.message
    };
  }

  // Check if email is in the admin list (if admin check is enabled)
  if (isAdminCheck && ADMIN_EMAILS.includes(email.toLowerCase().trim())) {
    return {
      isValid: false,
      isUsed: true,
      userType: 'admin',
      message: 'This email cannot be used for registration. Please use a different email address.'
    };
  }

  // Then check if it's already in use
  const { isUsed, userType, message } = await isEmailInUse(email);
  
  return {
    isValid: true,
    isUsed,
    userType,
    message: isUsed ? message : 'Email is valid and available'
  };
}

module.exports = {
  isEmailInUse,
  validateEmail,
  validateEmailFormat
};
