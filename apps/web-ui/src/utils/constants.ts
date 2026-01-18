export const APP_NAME = 'TripMind';

export const ROUTES = {
  HOME: '/',
  CHAT: '/chat',
  CHAT_SESSION: '/chat/:sessionId',
  CHAT_ROOM: '/:userId/:threadId/chat',
  TIMELINE: '/timeline/:travelId',
  TIMELINE_ROOM: '/:userId/:threadId/timeline',
  MY_TRAVELS: '/my-travels',
  TRAVEL_DETAILS: '/travel/:id',
  NOTIFICATIONS: '/notifications',
  LOGIN: '/login',
  REGISTER: '/register',
  AUTH_CALLBACK: '/auth/callback/:provider',
  PROFILE: '/profile',
} as const;

export const CURRENCY = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
} as const;

export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_WITH_TIME: 'MMM DD, YYYY HH:mm',
  ISO: 'YYYY-MM-DD',
  LONG: 'MMMM DD, YYYY',
} as const;

export const TIMELINE_ITEM_TYPES = {
  VISA: 'visa',
  FLIGHT: 'flight',
  HOTEL: 'hotel',
  ACTIVITY: 'activity',
  TRANSPORT: 'transport',
  RESTAURANT: 'restaurant',
  SHOPPING: 'shopping',
  PREPARATION: 'preparation',
  OTHER: 'other',
} as const;

export const TRIP_TYPES = {
  SOLO: 'solo',
  FAMILY: 'family',
  FRIENDS: 'friends',
  BUSINESS: 'business',
  COUPLE: 'couple',
  GROUP: 'group',
} as const;

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  CHAT_SESSION: 'chat_session',
} as const;
