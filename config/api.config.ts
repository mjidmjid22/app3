// API Configuration
const isDevelopment = __DEV__;
const isProduction = process.env.EXPO_PUBLIC_APP_ENV === 'production';

export const API_CONFIG = {
  // Development (local server)
  DEVELOPMENT_URL: 'http://192.168.0.114:5000',
  
  // Production (Railway deployment)
  PRODUCTION_URL: process.env.EXPO_PUBLIC_API_URL || 'https://app2-production-8eea.up.railway.app',
  
  // Get current API URL based on environment
  BASE_URL: isProduction 
    ? (process.env.EXPO_PUBLIC_API_URL || 'https://app2-production-8eea.up.railway.app')
    : 'http://192.168.0.114:5000'
};

export const API_URL = API_CONFIG.BASE_URL;