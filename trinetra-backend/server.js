const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./src/config/db');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

// Load environment variables first - try multiple paths
const dotenv = require('dotenv');
const fs = require('fs');

// Try to load .env from current directory first
if (fs.existsSync(path.join(__dirname, '.env'))) {
  dotenv.config({ path: path.join(__dirname, '.env') });
  console.log('Loaded .env from:', path.join(__dirname, '.env'));
} else {
  // Fallback to default dotenv behavior
  dotenv.config();
  console.log('Using default .env loading');
}

const app = express();

// Set default environment variables if not set
process.env.JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_key_for_development';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Connect to MongoDB with better error handling
(async () => {
  try {
    await connectDB();
    console.log('Database connected successfully');

    // Start server only after database connection is established
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Server accessible at:`);
      console.log(`  - http://localhost:${PORT}`);
      console.log(`  - http://192.168.1.5:${PORT}`);
      console.log(`  - http://10.0.2.2:${PORT} (Android emulator)`);
      console.log('Environment:', process.env.NODE_ENV || 'development');
    });
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }
})();

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI', 'ABUSEIPDB_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn('Missing environment variables:', missingEnvVars);
  console.warn('Some features may not work properly.');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

// Log environment variables (without exposing sensitive data)
console.log('Environment Check:');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('JWT_SECRET configured:', !!process.env.JWT_SECRET);
console.log('MONGODB_URI configured:', !!process.env.MONGODB_URI);
console.log('ABUSEIPDB_API_KEY configured:', !!process.env.ABUSEIPDB_API_KEY);

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Authentication middleware
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'No token provided'
      });
    }

    // Check if it's a Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Invalid token format'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'User not found'
      });
    }

    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Token expired'
      });
    }
    next(error);
  }
};

// Export authMiddleware for use in other files
module.exports.authMiddleware = authMiddleware;

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Routes
const authRoutes = require('./routes/auth');
const scanRoutes = require('./routes/scan');
const vpnRoutes = require('./routes/vpn');
const deviceRoutes = require('./routes/device');
const sosRoutes = require('./routes/sos');
const monitorRoutes = require('./routes/monitor');
const appsRoutes = require('./routes/apps');
const realTimeSecurityRoutes = require('./routes/realTimeSecurity');
const spamCallsRoutes = require('./routes/spamCalls');

// Public routes (for testing and demo)
app.use('/api/auth', authRoutes);
app.use('/api/apps', appsRoutes);

// Protected routes (but allow public access for demo)
app.use('/api/vpn', vpnRoutes);
app.use('/api/device', deviceRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/security/scan', scanRoutes);
app.use('/api/security/monitor', monitorRoutes);
app.use('/api/security', scanRoutes); // Add fallback route

// Real-time security routes
app.use('/api/security/realtime', realTimeSecurityRoutes);

// Spam calls routes
app.use('/api/spam-calls', spamCallsRoutes);

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('Test endpoint hit from:', req.ip);
  res.json({ 
    status: 'Server is running',
    message: 'Backend connection successful',
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV || 'development',
      abuseIPDBConfigured: !!process.env.ABUSEIPDB_API_KEY,
      virusTotalConfigured: !!process.env.VIRUSTOTAL_API_KEY,
      googleSafeBrowsingConfigured: !!process.env.GOOGLE_SAFE_BROWSING_API_KEY,
      port: process.env.PORT || 5000
    }
  });
});

// Simple health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Self ping endpoint for Render
app.get('/self-ping', (req, res) => {
  res.json({ 
    status: 'pong', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Add missing endpoint for frontend compatibility
app.get('/api/apps/installed', (req, res) => {
  // Redirect to the existing apps route
  res.redirect('/api/apps');
});

// CORS preflight for all routes
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

app.get('/', (req, res) => {
  res.send('Trinetra Backend API');
});

// Handle 404
app.use((req, res) => {
  console.log('404 Not Found:', req.method, req.url);
  res.status(404).json({ error: 'Not Found' });
});
