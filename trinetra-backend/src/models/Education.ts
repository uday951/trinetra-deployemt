import mongoose, { Document, Schema } from 'mongoose';

export interface IEducation extends Document {
  title: string;
  description: string;
  type: string;
  url?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EducationSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    trim: true,
    enum: ['article', 'video', 'course', 'quiz', 'other']
  },
  url: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
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

// Indexes for faster searches
EducationSchema.index({ type: 1 });
EducationSchema.index({ tags: 1 });
EducationSchema.index({ title: 'text', description: 'text' });

export const Education = mongoose.model<IEducation>('Education', EducationSchema); 