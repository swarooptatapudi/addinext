export const FORMIK_ERRORS = {
  REQUIRED: 'This field is required',
  REQUIRED_PATIENT: 'Patient Name is required',
  INVALID_URL: {
    VALUE: /^(http:\/\/|https:\/\/)/,
    MESSAGE: 'Invalid url',
  },
  INVALID_EMAIL: {
    VALUE:
      /^(?=.{1,64}@)[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)*@[^-][A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*(\.[A-Za-z]{2,})$/,
    MESSAGE: 'Invalid email',
  },
  FILES: {
    MIN_3MB: 'The file you upload is too big. Choose a file smaller than 3 MB.',
  },
  NUMBER_ONLY: {
    VALUE: /^\d+$/,
    MESSAGE: 'Must be a number'
  },
  POSITIVE_NUMBER: {
    MESSAGE: 'Must be a positive number'
  },
  INVALID_CONTACT_NUMBER: {
    VALUE: /^\d+$/,
    MESSAGE: ' Invalid contact number',
  },
  MOBILE_NUMBER: {
    VALUE: /^\+[1-9]\d{7,14}$/,
    MESSAGE: 'Enter a valid mobile number along with country code (e.g. +919876543210)',
  },
  MIN_2: { VALUE: 2, MESSAGE: 'Too Stort!' },
  MAX_50: { VALUE: 50, MESSAGE: 'Too Long!' },
  MAX_320: { VALUE: 320, MESSAGE: 'Maximum 320 characters are allowed.' },
  MAX_URL_2048: {
    VALUE: 2048,
    MESSAGE: 'URL exceeds the 2048 character limit.',
  },
};
