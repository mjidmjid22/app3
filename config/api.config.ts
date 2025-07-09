// API Configuration
const isDevelopment = __DEV__;
const isProduction = process.env.EXPO_PUBLIC_APP_ENV === 'production';

export const API_CONFIG = {
  // Development (local server) - will be overridden by .env.local
  DEVELOPMENT_URL: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.113:5000',
  
  // Production (New Vercel deployment without authentication)
  PRODUCTION_URL: process.env.EXPO_PUBLIC_API_URL || 'https://mantaeuvert-ogwqqcbh0-hamza-mjids-projects.vercel.app/api',
  
  // Get current API URL based on environment
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || (isProduction 
    ? 'https://mantaeuvert-ogwqqcbh0-hamza-mjids-projects.vercel.app/api'
    : 'http://192.168.0.113:5000')
};

export const API_URL = API_CONFIG.BASE_URL;