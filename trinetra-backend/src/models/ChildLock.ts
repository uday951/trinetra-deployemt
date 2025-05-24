import mongoose, { Document, Schema } from 'mongoose';

export interface IChildLock extends Document {
  userId: string;
  deviceId: string;
  enabled: boolean;
  restrictions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ChildLockSchema = new Schema({
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
  enabled: {
    type: Boolean,
    default: false
  },
  restrictions: [{
    type: String,
    trim: true
  }],
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
ChildLockSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

export const ChildLock = mongoose.model<IChildLock>('ChildLock', ChildLockSchema); 