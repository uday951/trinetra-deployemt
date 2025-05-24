import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { createServer } from 'http';
import WebSocket from 'ws';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';
import { auth, AuthRequest } from './middleware/auth';

// Import routes
import securityRoutes from './routes/security';
import vpnRoutes from './routes/vpn';
import deviceRoutes from './routes/device';
import appsRoutes from './routes/apps';
import alertsRoutes from './routes/alerts';
import sosRoutes from './routes/sos';
import childlockRoutes from './routes/childlock';
import educationRoutes from './routes/education';
import geofenceRoutes from './routes/geofence';

// Load environment variables
dotenv.config();

// Set development environment
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
console.log('Environment:', process.env.NODE_ENV);

const app: Express = express();
const server = createServer(app);
const wss = new WebSocket.Server({ server });

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request body:', req.body);
  }
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trinetra')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Routes
app.use('/api/security', securityRoutes);
app.use('/api/vpn', vpnRoutes);
app.use('/api/device', deviceRoutes);
app.use('/api/apps', appsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/childlock', childlockRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/geofence', geofenceRoutes);

// Protected route example
app.get('/api/protected', auth, (req: AuthRequest, res: Response) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// WebSocket connection handling for real-time alerts
wss.on('connection', (ws: WebSocket) => {
  console.log('New client connected');
  
  ws.on('message', (message: string) => {
    console.log('Received:', message);
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'healthy',
    environment: process.env.NODE_ENV
  });
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
}); 