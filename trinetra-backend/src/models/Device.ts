import mongoose from 'mongoose';

export interface IDevice extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  deviceId: string;
  name: string;
  userId: mongoose.Types.ObjectId;
  status: 'active' | 'inactive' | 'locked';
  lastSeen: Date;
  location?: {
    latitude: number;
    longitude: number;
    lastUpdated: Date;
  };
  settings: {
    vpnEnabled: boolean;
    childLockEnabled: boolean;
    antiTheftEnabled: boolean;
    notificationsEnabled: boolean;
  };
}

const deviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'locked', 'wiped'],
    default: 'active',
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  location: {
    latitude: Number,
    longitude: Number,
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  settings: {
    vpnEnabled: {
      type: Boolean,
      default: false,
    },
    childLockEnabled: {
      type: Boolean,
      default: false,
    },
    antiTheftEnabled: {
      type: Boolean,
      default: true,
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
  },
});

export const Device = mongoose.model<IDevice>('Device', deviceSchema); 