export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  socketUrl: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  facebookAppId: import.meta.env.VITE_FACEBOOK_APP_ID || '',

  // App settings
  appName: 'TripMind',
  defaultCurrency: 'USD',
  defaultLocale: 'en-US',

  // Pagination
  defaultPageSize: 10,
  maxPageSize: 100,

  // UI settings
  sidebarWidth: 280,
  headerHeight: 64,

  // Timeouts
  requestTimeout: 30000,
  debounceDelay: 300,

  // Feature flags
  features: {
    socialLogin: true,
    chatBot: true,
    notifications: true,
    realTimeUpdates: true,
  },
};

export default appConfig;
