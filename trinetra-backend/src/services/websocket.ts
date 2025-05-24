import { Server } from 'socket.io';
import { Server as HttpServer, createServer } from 'http';
import { Device, IDevice } from '../models/Device';
import { Geofence } from '../models/Geofence';
import { Types } from 'mongoose';

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

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: "http://localhost:19006", // Expo development server
        methods: ["GET", "POST"]
      }
    });

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
}


