// Main API Router for OneMedi Healthcare Platform
// Combines all API routes with middleware and error handling

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { API_CONFIG, HTTP_STATUS, ERROR_MESSAGES } from './config/api-config';
import { securityHeaders, corsMiddleware } from './middleware/auth-middleware';
import { logSecurityEvent } from './utils/security-logger';

// Import route modules
import authRoutes from './routes/auth';
import medicinesRoutes from './routes/medicines';
import ordersRoutes from './routes/orders';
import evitalrxRoutes from './routes/evitalrx';
import paymentsRoutes from './routes/payments';

// Create Express app
const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      API_CONFIG.CORS.ORIGIN,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8080',
      'https://onemedi-admin.vercel.app',
      'https://onemedi-frontend.vercel.app'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: API_CONFIG.CORS.METHODS,
  allowedHeaders: API_CONFIG.CORS.ALLOWED_HEADERS,
  credentials: API_CONFIG.CORS.CREDENTIALS,
  maxAge: 86400 // 24 hours
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers middleware
app.use(securityHeaders);

// Global rate limiting
const globalRateLimit = rateLimit({
  windowMs: API_CONFIG.RATE_LIMIT.WINDOW_MS,
  max: API_CONFIG.RATE_LIMIT.MAX_REQUESTS,
  message: {
    success: false,
    error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: async (req, res) => {
    await logSecurityEvent('rate_limit_exceeded', 'high', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.path
    });
    
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }
});

app.use(globalRateLimit);

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'error' : 'info';
    
    console.log(`[${new Date().toISOString()}] ${logLevel.toUpperCase()} ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    
    // Log security events for failed requests
    if (res.statusCode >= 400) {
      logSecurityEvent('api_error', 'medium', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
    }
  });
  
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API documentation endpoint
app.get('/api/docs', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      title: 'OneMedi Healthcare API',
      version: '1.0.0',
      description: 'Complete healthcare management API for OneMedi platform',
      baseUrl: API_CONFIG.BASE_URL,
      endpoints: {
        authentication: {
          login: 'POST /api/auth/login',
          logout: 'POST /api/auth/logout',
          refresh: 'POST /api/auth/refresh',
          profile: 'GET /api/auth/profile'
        },
        medicines: {
          list: 'GET /api/medicines',
          create: 'POST /api/medicines',
          get: 'GET /api/medicines/:id',
          update: 'PUT /api/medicines/:id',
          delete: 'DELETE /api/medicines/:id',
          categories: 'GET /api/medicines/categories',
          bulk: 'POST /api/medicines/bulk'
        },
        orders: {
          list: 'GET /api/orders',
          create: 'POST /api/orders',
          get: 'GET /api/orders/:id',
          updateStatus: 'PUT /api/orders/:id/status',
          tracking: 'GET /api/orders/:id/tracking',
          analytics: 'GET /api/orders/analytics/dashboard'
        },
        payments: {
          create: 'POST /api/payments/create',
          verify: 'POST /api/payments/verify'
        },
        evitalrx: {
          products: 'GET /api/evitalrx/products',
          sync: 'POST /api/evitalrx/sync',
          logs: 'GET /api/evitalrx/sync/logs',
          webhook: 'POST /api/evitalrx/webhook'
        }
      },
      authentication: {
        type: 'Bearer Token',
        header: 'Authorization: Bearer <token>',
        obtain: 'POST /api/auth/login'
      },
      rateLimit: {
        global: `${API_CONFIG.RATE_LIMIT.MAX_REQUESTS} requests per ${API_CONFIG.RATE_LIMIT.WINDOW_MS / 1000} seconds`,
        authentication: '5 login attempts per 15 minutes',
        api: '1000 requests per 15 minutes'
      }
    }
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicinesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/evitalrx', evitalrxRoutes);
app.use('/api/payments', paymentsRoutes);

// API status endpoint
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'operational',
      services: {
        authentication: 'operational',
        healthcare: 'operational',
        payments: 'operational',
        evitalrx: 'degraded',
        database: 'operational'
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    }
  });
});

// 404 handler for API routes
app.use('/api/*', (req: Request, res: Response) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: ERROR_MESSAGES.NOT_FOUND,
    code: 'ENDPOINT_NOT_FOUND',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error handler:', error);
  
  // Log security event for errors
  logSecurityEvent('api_error', 'high', {
    error: error.message,
    stack: error.stack,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: ERROR_MESSAGES.VALIDATION_ERROR,
      code: 'VALIDATION_ERROR',
      details: error.details
    });
  }

  if (error.name === 'UnauthorizedError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: ERROR_MESSAGES.UNAUTHORIZED,
      code: 'UNAUTHORIZED'
    });
  }

  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'File size too large',
      code: 'FILE_SIZE_EXCEEDED'
    });
  }

  // Default error response
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? ERROR_MESSAGES.INTERNAL_ERROR 
      : error.message,
    code: 'INTERNAL_SERVER_ERROR'
  });
});

// Graceful shutdown handler
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 OneMedi API Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`📊 API Status: http://localhost:${PORT}/api/status`);
  console.log(`🔒 Security: Enterprise-grade protection enabled`);
});

export default app;
