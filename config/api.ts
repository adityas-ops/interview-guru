// API Configuration
export const API_CONFIG = {
  GOOGLE_AI_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY || '',
};

// Debug logging (remove in production)
if (process.env.NODE_ENV === 'development') {
  // console.log('Environment variable EXPO_PUBLIC_GOOGLE_AI_API_KEY:', process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY ? 'Set' : 'Not set');
  // console.log('Environment variable GOOGLE_GENERATIVE_AI_API_KEY:', process.env.GOOGLE_GENERATIVE_AI_API_KEY ? 'Set' : 'Not set');
  // console.log('Final API key loaded:', API_CONFIG.GOOGLE_AI_API_KEY ? 'Yes' : 'No');
}

// Validate API key
export const validateApiKey = (): boolean => {
  return API_CONFIG.GOOGLE_AI_API_KEY.length > 0;
};
