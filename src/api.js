// src/api.js
export const API_BASE =
  process.env.NODE_ENV === 'production'
    ? 'https://dreamcoded.com/api'
    : 'https://dreamcoded.com/api';  // same in dev, since you want remote
