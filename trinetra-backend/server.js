const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/db');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

// Connect to MongoDB
connectDB();

// Validate required environment variables
const requiredEnvVars = ['ABUSEIPDB_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

// Log environment variables (without exposing the full API key)
console.log('Environment Check:');
console.log('PORT:', process.env.PORT);
console.log('ABUSEIPDB_API_KEY configured:', !!process.env.ABUSEIPDB_API_KEY);
console.log('ABUSEIPDB_API_KEY length:', process.env.ABUSEIPDB_API_KEY ? process.env.ABUSEIPDB_API_KEY.length : 0);
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const scanRoutes = require('./routes/scan');
const vpnRoutes = require('./routes/vpn');
const deviceRoutes = require('./routes/device');
const sosRoutes = require('./routes/sos');

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'Server is running',
    env: {
      port: process.env.PORT,
      abuseipdbConfigured: !!process.env.ABUSEIPDB_API_KEY,
      nodeEnv: process.env.NODE_ENV || 'development'
    }
  });
});

app.use('/api/security', scanRoutes);
app.use('/api/vpn', vpnRoutes);
app.use('/api/device', deviceRoutes);
app.use('/api/sos', sosRoutes);

app.get('/', (req, res) => {
  res.send('Trinetra Backend API');
});

// Handle 404
app.use((req, res) => {
  console.log('404 Not Found:', req.method, req.url);
  res.status(404).json({ error: 'Not Found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
});
