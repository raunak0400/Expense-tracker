import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { connectDB } from "./DB/Database.js";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import transactionRoutes from "./Routers/Transactions.js";
import userRoutes from "./Routers/userRouter.js";
import path from "path";

// Load environment variables
dotenv.config();
const app = express();

// Use PORT from environment or default to 5000
const port = process.env.PORT || 5000;

// Connect to database with error handling
let dbConnected = false;
connectDB().then(() => {
  dbConnected = true;
  console.log('🎉 Database connection successful!');
}).catch((error) => {
  console.error('❌ Failed to connect to database:', error.message);
  dbConnected = false;
});

// CORS configuration - allow multiple origins for production
const allowedOrigins = [
  process.env.FRONTEND_URL, // Main production URL
  "https://financeflow-pro-frontend.vercel.app", // Add your actual frontend URL
  "https://main.d1sj7cd70hlter.amplifyapp.com",
  "https://expense-tracker-app-three-beryl.vercel.app",
  "http://localhost:3000", // Development
  "http://localhost:3001", // Alternative development port
].filter(Boolean); // Remove undefined values

// Middleware
app.use(express.json());
// Very permissive CORS for testing
app.use(cors());

// Add these headers manually
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
// Enhanced security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Logging - use 'combined' in production, 'dev' in development
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Router
app.use("/api/v1", transactionRoutes);
app.use("/api/auth", userRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "FinanceFlow Pro API is running! 💰",
    version: "1.0.0",
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

// API health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongoConnected: mongoose.connection.readyState === 1,
    hasMongoURI: !!process.env.MONGO_URI
  });
});

// Debug route to check environment (remove after fixing)
app.get("/api/debug", (req, res) => {
  const mongoURI = process.env.MONGO_URI;
  res.json({
    nodeEnv: process.env.NODE_ENV,
    hasMongoURI: !!mongoURI,
    hasJWTSecret: !!process.env.JWT_SECRET,
    mongoState: mongoose.connection.readyState,
    mongoStateText: {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    }[mongoose.connection.readyState],
    mongoURI: mongoURI ? `mongodb+srv://${mongoURI.split('@')[1]}` : 'Not set',
    connectionHost: mongoose.connection.host || 'Not connected'
  });
});

// Simple test registration endpoint
app.post("/api/test-register", async (req, res) => {
  try {
    console.log('🧪 Test registration started');
    console.log('Request body:', req.body);
    console.log('MongoDB state:', mongoose.connection.readyState);
    
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing fields",
        received: { name: !!name, email: !!email, password: !!password }
      });
    }
    
    // Test if we can connect to User model
    const User = mongoose.model('User');
    console.log('User model loaded:', !!User);
    
    res.json({
      success: true,
      message: "Test registration endpoint working",
      mongoConnected: mongoose.connection.readyState === 1,
      data: { name, email, password: '[HIDDEN]' }
    });
    
  } catch (error) {
    console.error('❌ Test registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack
    });
  }
});

// Global error handler with detailed logging
app.use((err, req, res, next) => {
  console.error('❌ Error occurred:');
  console.error('Path:', req.path);
  console.error('Method:', req.method);
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message,
    path: req.path
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 FinanceFlow Pro API is running on port ${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS Origins: ${allowedOrigins.join(', ')}`);
});
