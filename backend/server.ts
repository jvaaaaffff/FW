import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import winston from "winston";
import dotenv from "dotenv";
import { connectDB } from "./db.js";

dotenv.config({ quiet: true });
const isVerbose = process.env.NODE_ENV !== 'production';

// Setup logging
const logger = winston.createLogger({
  level: isVerbose ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'fashionweb-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (isVerbose) {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import promotionRoutes from "./routes/promotionRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import { startBackgroundJobs } from "./jobs/backgroundJobs.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { productService } from "./services/productService.js";
import { initializeRedis, getRedisClient, redisHealthCheck } from "./middleware/cacheMiddleware.js";
import { apiLimiter, authLimiter, otpLimiter, productLimiter } from "./middleware/rateLimitMiddleware.js";

function setupGlobalHandlers() {
  process.on('unhandledRejection', (reason) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Unhandled Rejection:', reason);
    } else {
      console.error('Unhandled Rejection occurred.');
    }
  });

  process.on('uncaughtException', (error) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Uncaught Exception:', error);
    } else {
      console.error('Uncaught Exception occurred.');
    }
    process.exit(1);
  });
}

async function startServer() {
  setupGlobalHandlers();
  const app = express();
  const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
  const HOST = process.env.HOST || '0.0.0.0';

  // Trust proxy for rate limiting behind load balancers
  app.set('trust proxy', 1);

  // Middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", process.env.API_DOMAIN || "https://api.example.com"],
      },
    },
  }));
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : (process.env.NODE_ENV === 'production'
      ? ['https://yourdomain.com', 'https://www.yourdomain.com']
      : ['http://localhost:5173', 'http://127.0.0.1:5173']),
    credentials: true
  }));
  app.use(compression()); // Enable gzip compression
  app.use(express.json({ limit: '10mb' })); // Increase payload limit
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging middleware
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      body: req.method !== 'GET' ? req.body : undefined
    });
    next();
  });

  // Return a safe API error when the database is unavailable
  app.use('/api', (req, res, next) => {
    if (req.path === '/health') {
      return next();
    }

    if (mongoose.connection.readyState !== 1) {
      const err = new Error('Service temporarily unavailable. Please try again later.');
      (err as any).statusCode = 503;
      return next(err);
    }
    next();
  });

  // Initialize Redis (non-blocking - cache is optional)
  initializeRedis().catch((err) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️  Redis initialization failed — continuing without cache:', err.message);
    } else {
      console.warn('⚠️  Redis initialization failed — cache disabled.');
    }
  });

  // Connect to MongoDB with performance optimizations
  try {
    await connectDB();
    if (process.env.NODE_ENV === 'development') {
      console.log("✅ MongoDB connected successfully");
    }

    // Enable mongoose debugging only when explicitly requested
    if (process.env.MONGO_DEBUG === 'true') {
      mongoose.set('debug', true);
    }

    await productService.seedProducts();
    if (isVerbose) {
      console.log("✅ Product seed data loaded");
    }
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB — server cannot start safely:", error);
    process.exit(1); // Exit so the process manager can restart with a fresh connection
  }

  // Start background jobs
  startBackgroundJobs();

  // Health check endpoint with Redis status
  app.get("/api/health", async (req: express.Request, res: express.Response) => {
    const redisHealthy = await redisHealthCheck();
    const dbHealthy = mongoose.connection.readyState === 1;

    const response: any = {
      status: "ok",
      message: "Backend is running!",
      services: {
        database: dbHealthy ? "healthy" : "unhealthy",
        redis: redisHealthy ? "healthy" : "unhealthy",
        uptime: process.uptime(),
      }
    };

    if (process.env.NODE_ENV !== 'production') {
      response.memory = process.memoryUsage();
    }

    res.json(response);
  });

  // Rate limiting middleware
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
  app.use('/api/auth/send-otp', otpLimiter);
  app.use('/api/products', productLimiter);
  app.use('/api/', apiLimiter);

  // API routes
  app.use("/api/users", userRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/promotions", promotionRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/orders", orderRoutes);

  // Error Handler Middleware (must be after routes)
  app.use(errorHandler);

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await mongoose.connection.close();
    const redisClient = getRedisClient();
    if (redisClient) {
      await redisClient.quit();
    }
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await mongoose.connection.close();
    const redisClient = getRedisClient();
    if (redisClient) {
      await redisClient.quit();
    }
    process.exit(0);
  });

  app.listen(PORT, HOST, () => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🚀 Backend API server running on http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
      if (isVerbose) {
        console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
        console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      }
    }
  });
}

startServer().catch((error) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error('Failed to start server:', error);
  } else {
    console.error('Failed to start server.');
  }
  process.exit(1);
});
