import mongoose, { Document, Schema } from 'mongoose';

export interface ILocation {
  latitude: number;
  longitude: number;
}

export interface IGeofence extends Document {
  userId: string;
  deviceId: string;
  name: string;
  radius: number;
  location: ILocation;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GeofenceSchema = new Schema({
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
  name: {
    type: String,
    required: true,
    trim: true
  },
  radius: {
    type: Number,
    required: true,
    min: 50, // minimum radius in meters
    max: 10000 // maximum radius in meters
  },
  location: {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    }
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
GeofenceSchema.index({ userId: 1, deviceId: 1 });

// Geospatial index for location-based queries
GeofenceSchema.index({ 'location': '2dsphere' });

export const Geofence = mongoose.model<IGeofence>('Geofence', GeofenceSchema); 