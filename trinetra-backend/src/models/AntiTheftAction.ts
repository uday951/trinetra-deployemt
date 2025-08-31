import mongoose, { Document, Schema } from 'mongoose';

export interface IAntiTheftAction extends Document {
  deviceId: string;
  action: 'lock' | 'wipe' | 'alarm' | 'locate';
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  metadata?: {
    location?: {
      latitude: number;
      longitude: number;
    };
    reason?: string;
    initiatedBy?: string;
  };
  createdAt: Date;
  updatedAt?: Date;
}

const AntiTheftActionSchema = new Schema<IAntiTheftAction>({
  deviceId: {
    type: String,
    required: true,
    index: true,
  },
  action: {
    type: String,
    required: true,
    enum: ['lock', 'wipe', 'alarm', 'locate'],
  },
  timestamp: {
    type: Date,
    required: true,
    index: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  metadata: {
    location: {
      latitude: {
        type: Number,
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180,
      },
    },
    reason: String,
    initiatedBy: String,
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
AntiTheftActionSchema.index({ deviceId: 1, timestamp: -1 });
AntiTheftActionSchema.index({ status: 1, createdAt: -1 });

// TTL index to automatically delete old action data after 90 days
AntiTheftActionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const AntiTheftAction = mongoose.model<IAntiTheftAction>('AntiTheftAction', AntiTheftActionSchema);