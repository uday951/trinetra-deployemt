import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import mongoose from 'mongoose';

export interface AuthRequest extends Request {
  user?: {
    _id: mongoose.Types.ObjectId | string;
    email: string;
    name: string;
    role: string;
    devices: string[];
  };
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new Error();
    }

    req.user = {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      devices: user.devices
    };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
}; 