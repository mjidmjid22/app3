// API Configuration
const isDevelopment = __DEV__;
const isProduction = process.env.EXPO_PUBLIC_APP_ENV === 'production';

export const API_CONFIG = {
  // Development (local server) - will be overridden by .env.local
  DEVELOPMENT_URL: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.113:5000',
  
  // Production (Railway deployment)
  PRODUCTION_URL: process.env.EXPO_PUBLIC_API_URL || 'https://mantaeuvert-dhahivr0v-hamza-mjids-projects.vercel.app',
  
  // Get current API URL based on environment
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || (isProduction 
    ? 'https://mantaeuvert-dhahivr0v-hamza-mjids-projects.vercel.app'
    : 'http://192.168.0.113:5000')
};

export const API_URL = API_CONFIG.BASE_URL;