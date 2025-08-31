import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import deviceRoutes from './routes/device';
import geofenceRoutes from './routes/geofence';
import antiTheftRoutes from './routes/anti-theft';
import securityRoutes from './routes/security';
import { WebSocketServer } from './services/websocket';
import { setWebSocketServer } from './routes/device';
import { initWebSocket as initAntiTheftWebSocket } from './routes/anti-theft';
import app from './config/server';

const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize WebSocket
const httpServer = require('http').createServer(app);
const websocketServer = new WebSocketServer(httpServer);
setWebSocketServer(websocketServer);
initAntiTheftWebSocket(httpServer);

// Routes
app.use('/api/device', deviceRoutes);
app.use('/api/geofence', geofenceRoutes);
app.use('/api/anti-theft', antiTheftRoutes);
app.use('/api/security', securityRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Start server
httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Health check available at http://localhost:${port}/health`);
  console.log(`Security monitoring endpoints available at http://localhost:${port}/api/security/monitor/*`);
});
