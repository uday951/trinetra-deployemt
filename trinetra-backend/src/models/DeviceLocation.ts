import mongoose, { Document, Schema } from 'mongoose';

export interface IDeviceLocation extends Document {
  deviceId: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  accuracy?: number;
  createdAt: Date;
  updatedAt?: Date;
}

const DeviceLocationSchema = new Schema<IDeviceLocation>({
  deviceId: {
    type: String,
    required: true,
    index: true,
  },
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90,
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180,
  },
  timestamp: {
    type: Date,
    required: true,
    index: true,
  },
  accuracy: {
    type: Number,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
  },
});

// Create compound index for efficient queries
DeviceLocationSchema.index({ deviceId: 1, timestamp: -1 });

// TTL index to automatically delete old location data after 30 days
DeviceLocationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const DeviceLocation = mongoose.model<IDeviceLocation>('DeviceLocation', DeviceLocationSchema);