import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Device, IDevice } from '../models/Device';
import { Geofence } from '../models/Geofence';
import { Types } from 'mongoose';
import { WebSocket, WebSocketServer as WSServer } from 'ws';
import SecurityMonitorService from './securityMonitor';

interface DeviceLocationData {
  deviceId: string;
  location: {
    lat: number;
    lng: number;
  };
}

interface GeofenceViolationData {
  deviceId: string;
  geofenceId: string;
}

export class WebSocketServer {
  private io: Server;
  private clients: Map<string, string[]> = new Map(); // userId -> socketIds map
  private wss: WSServer;
  private securityMonitor: SecurityMonitorService;

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    this.wss = new WSServer({ server });
    this.securityMonitor = SecurityMonitorService.getInstance();

    this.setupListeners();
  }

  private setupListeners() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('auth', async (userId: string) => {
        const device = await Device.findOne({ userId });
        if (device) {
          this.clients.set(userId, [...(this.clients.get(userId) || []), socket.id]);
          socket.join(userId);
          
          // Send initial state
          const geofences = await Geofence.find({ userId });
          socket.emit('geofences', geofences);
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        // Clean up socket
      });

      socket.on('device-location', async (data: DeviceLocationData) => {
        const { deviceId, location } = data;
        const device = await Device.findById(deviceId);
        if (device) {
          device.location = {
            latitude: location.lat,
            longitude: location.lng,
            lastUpdated: new Date()
          };
          await device.save();
          
          // Notify all clients associated with this device's user
          const userId = device.userId.toString();
          const socketIds = this.clients.get(userId);
          if (socketIds) {
            socketIds.forEach(socketId => {
              this.io.to(socketId).emit('device-location-update', { 
                deviceId, 
                location: {
                  lat: location.lat,
                  lng: location.lng
                }
              });
            });
          }
        }
      });

      socket.on('geofence-violation', async (data: GeofenceViolationData) => {
        const { deviceId, geofenceId } = data;
        const device = await Device.findById(deviceId);
        if (device) {
          // Notify user about violation
          const userId = device.userId.toString();
          const socketIds = this.clients.get(userId);
          if (socketIds) {
            socketIds.forEach(socketId => {
              this.io.to(socketId).emit('geofence-violation', data);
            });
          }
        }
      });
    });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New WebSocket connection established');

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          if (data.type === 'subscribe_security') {
            this.securityMonitor.addClient(ws);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        console.log('WebSocket connection closed');
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  }

  public emitDeviceLock(deviceId: string) {
    this.io.emit('device-locked', { deviceId });
  }

  public emitDeviceWipe(deviceId: string) {
    this.io.emit('device-wiped', { deviceId });
  }

  public emitDeviceLocation(deviceId: string) {
    this.io.emit('device-location-update', { deviceId });
  }

  public broadcast(message: any) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WSServer.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}


