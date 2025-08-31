const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trinetra';
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    // Create indexes for better performance
    await Promise.all([
      mongoose.connection.collection('users').createIndex({ email: 1 }, { unique: true }),
      mongoose.connection.collection('devices').createIndex({ owner: 1 }),
      mongoose.connection.collection('devices').createIndex({ deviceId: 1 }, { unique: true })
    ]);

  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Handle application shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error closing database:', error);
    process.exit(1);
  }
});

module.exports = { connectDB }; 