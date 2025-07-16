// API Configuration for OneMedi Healthcare Platform
// Centralized configuration for all API endpoints and settings

export const API_CONFIG = {
  // Base configuration
  BASE_URL: process.env.VITE_API_BASE_URL || 'http://localhost:3001',
  API_VERSION: 'v1',
  TIMEOUT: 30000, // 30 seconds
  
  // Rate limiting configuration
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 1000, // requests per window
    SKIP_SUCCESSFUL_REQUESTS: false,
    SKIP_FAILED_REQUESTS: false,
  },
  
  // Authentication configuration
  AUTH: {
    JWT_SECRET: process.env.VITE_JWT_SECRET || 'onemedi-healthcare-secret-key',
    JWT_EXPIRES_IN: '24h',
    REFRESH_TOKEN_EXPIRES_IN: '7d',
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_TIME: 15 * 60 * 1000, // 15 minutes
  },
  
  // Security headers
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
  },
  
  // CORS configuration
  CORS: {
    ORIGIN: process.env.VITE_FRONTEND_URL || 'http://localhost:3000',
    METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    ALLOWED_HEADERS: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Requested-With'],
    CREDENTIALS: true,
  },
  
  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
  
  // File upload configuration
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    UPLOAD_PATH: '/uploads',
  },
  
  // Cache configuration
  CACHE: {
    DEFAULT_TTL: 300, // 5 minutes
    REDIS_URL: process.env.VITE_REDIS_URL || 'redis://localhost:6379',
  },
  
  // Logging configuration
  LOGGING: {
    LEVEL: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    MAX_FILES: 5,
    MAX_SIZE: '20m',
  },
  
  // Third-party API configurations
  THIRD_PARTY: {
    EVITALRX: {
      BASE_URL: 'https://dev-api.evitalrx.in/v1',
      API_KEY: process.env.VITE_EVITALRX_API_KEY || 'NAQ5XNukAVMPGdbJkjJcMUK9DyYBeTpu',
      TIMEOUT: 15000,
    },
    RAZORPAY: {
      KEY_ID: process.env.VITE_RAZORPAY_KEY_ID,
      KEY_SECRET: process.env.VITE_RAZORPAY_KEY_SECRET,
      WEBHOOK_SECRET: process.env.VITE_RAZORPAY_WEBHOOK_SECRET,
    },
    PHONEPE: {
      MERCHANT_ID: process.env.VITE_PHONEPE_MERCHANT_ID,
      SALT_KEY: process.env.VITE_PHONEPE_SALT_KEY,
      SALT_INDEX: process.env.VITE_PHONEPE_SALT_INDEX,
    },
    PAYTM: {
      MERCHANT_ID: process.env.VITE_PAYTM_MERCHANT_ID,
      MERCHANT_KEY: process.env.VITE_PAYTM_MERCHANT_KEY,
    },
    TWILIO: {
      ACCOUNT_SID: process.env.VITE_TWILIO_ACCOUNT_SID,
      AUTH_TOKEN: process.env.VITE_TWILIO_AUTH_TOKEN,
      PHONE_NUMBER: process.env.VITE_TWILIO_PHONE_NUMBER,
    },
    SENDGRID: {
      API_KEY: process.env.VITE_SENDGRID_API_KEY,
      FROM_EMAIL: process.env.VITE_SENDGRID_FROM_EMAIL,
    },
    MSG91: {
      API_KEY: process.env.VITE_MSG91_API_KEY,
      SENDER_ID: process.env.VITE_MSG91_SENDER_ID,
    },
  },
};

// API Endpoints structure
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    PROFILE: '/auth/profile',
  },
  
  // User management endpoints
  USERS: {
    BASE: '/users',
    BY_ID: '/users/:id',
    ROLES: '/users/roles',
    PERMISSIONS: '/users/permissions',
    BULK: '/users/bulk',
  },
  
  // Healthcare module endpoints
  MEDICINES: {
    BASE: '/medicines',
    BY_ID: '/medicines/:id',
    CATEGORIES: '/medicines/categories',
    SEARCH: '/medicines/search',
    BULK: '/medicines/bulk',
    INVENTORY: '/medicines/inventory',
  },
  
  ORDERS: {
    BASE: '/orders',
    BY_ID: '/orders/:id',
    STATUS: '/orders/:id/status',
    ITEMS: '/orders/:id/items',
    PAYMENT: '/orders/:id/payment',
    TRACKING: '/orders/:id/tracking',
  },
  
  PATIENTS: {
    BASE: '/patients',
    BY_ID: '/patients/:id',
    MEDICAL_HISTORY: '/patients/:id/medical-history',
    PRESCRIPTIONS: '/patients/:id/prescriptions',
    APPOINTMENTS: '/patients/:id/appointments',
  },
  
  DOCTORS: {
    BASE: '/doctors',
    BY_ID: '/doctors/:id',
    SPECIALIZATIONS: '/doctors/specializations',
    AVAILABILITY: '/doctors/:id/availability',
    CONSULTATIONS: '/doctors/:id/consultations',
  },
  
  LAB_TESTS: {
    BASE: '/lab-tests',
    BY_ID: '/lab-tests/:id',
    CATEGORIES: '/lab-tests/categories',
    BOOKINGS: '/lab-tests/bookings',
    REPORTS: '/lab-tests/reports',
  },
  
  // eVitalRx integration endpoints
  EVITALRX: {
    SYNC: '/evitalrx/sync',
    PRODUCTS: '/evitalrx/products',
    INVENTORY: '/evitalrx/inventory',
    ORDERS: '/evitalrx/orders',
    WEBHOOK: '/evitalrx/webhook',
  },
  
  // Payment gateway endpoints
  PAYMENTS: {
    BASE: '/payments',
    RAZORPAY: '/payments/razorpay',
    PHONEPE: '/payments/phonepe',
    PAYTM: '/payments/paytm',
    WEBHOOK: '/payments/webhook',
    VERIFY: '/payments/verify',
  },
  
  // Location and delivery endpoints
  LOCATIONS: {
    BASE: '/locations',
    BY_ID: '/locations/:id',
    SERVICEABILITY: '/locations/serviceability',
    DELIVERY: '/locations/delivery',
  },
  
  // Marketing endpoints
  MARKETING: {
    CAMPAIGNS: '/marketing/campaigns',
    SEGMENTS: '/marketing/segments',
    TEMPLATES: '/marketing/templates',
    ANALYTICS: '/marketing/analytics',
  },
  
  // Website configuration endpoints
  WEBSITE: {
    CONFIG: '/website/config',
    LAYOUT: '/website/layout',
    CONTENT: '/website/content',
    SEO: '/website/seo',
  },
  
  // Analytics and reporting endpoints
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    REPORTS: '/analytics/reports',
    METRICS: '/analytics/metrics',
    EXPORT: '/analytics/export',
  },
  
  // Third-party integrations
  INTEGRATIONS: {
    SMS: '/integrations/sms',
    EMAIL: '/integrations/email',
    WHATSAPP: '/integrations/whatsapp',
    NOTIFICATIONS: '/integrations/notifications',
  },
  
  // System endpoints
  SYSTEM: {
    HEALTH: '/system/health',
    STATUS: '/system/status',
    LOGS: '/system/logs',
    BACKUP: '/system/backup',
  },
};

// HTTP Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
};

// Error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Insufficient permissions',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation failed',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
  INTERNAL_ERROR: 'Internal server error',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
};

// Success messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
};

export default API_CONFIG;
