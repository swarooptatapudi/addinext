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
  INVALID_CONTACT_NUMBER: {
    VALUE: /^\d+$/,
    MESSAGE: ' Invalid contact number',
  },
  MOBILE_NUMBER:{
    VALUE:/^\+[1-9]\d{1,2}\d{10}$/,
    MESSAGE: 'Mobile must include country code and 10 digits (e.g. +911234567890)',
  },
  MIN_2: { VALUE: 2, MESSAGE: 'Too Stort!' },
  MAX_50: { VALUE: 50, MESSAGE: 'Too Long!' },
  MAX_320: { VALUE: 320, MESSAGE: 'Maximum 320 characters are allowed.' },
  MAX_URL_2048: {
    VALUE: 2048,
    MESSAGE: 'URL exceeds the 2048 character limit.',
  },
};
