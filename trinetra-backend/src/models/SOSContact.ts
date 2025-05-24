import mongoose, { Document, Schema } from 'mongoose';

export interface ISOSContact extends Document {
  userId: string;
  name: string;
  phone: string;
  email?: string;
  createdAt: Date;
}

const SOSContactSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v: string | undefined): boolean {
        return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: (props: { value: string }) => `${props.value} is not a valid email address!`
    }
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

export const SOSContact = mongoose.model<ISOSContact>('SOSContact', SOSContactSchema); 