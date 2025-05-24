import mongoose, { Document, Schema } from 'mongoose';

export interface ISafeApp extends Document {
  userId: string;
  deviceId: string;
  appName: string;
  packageName: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SafeAppSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  appName: {
    type: String,
    required: true,
    trim: true
  },
  packageName: {
    type: String,
    required: true,
    trim: true
  },
  enabled: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(_doc: any, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Compound index for faster lookups
SafeAppSchema.index({ userId: 1, deviceId: 1, packageName: 1 }, { unique: true });

export const SafeApp = mongoose.model<ISafeApp>('SafeApp', SafeAppSchema); 