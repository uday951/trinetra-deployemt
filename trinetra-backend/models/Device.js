const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  deviceId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'locked', 'wiping', 'warning'],
    default: 'offline'
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  os: {
    platform: String,
    distro: String,
    release: String,
    kernel: String
  },
  hardware: {
    manufacturer: String,
    model: String,
    cpu: {
      manufacturer: String,
      brand: String,
      cores: Number,
      speed: Number
    },
    memory: {
      total: Number,
      free: Number,
      used: Number
    }
  },
  network: {
    interfaces: [{
      name: String,
      address: String,
      netmask: String,
      mac: String
    }],
    lastIpAddress: String
  },
  location: {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    lastUpdated: Date
  },
  security: {
    isRooted: {
      type: Boolean,
      default: false
    },
    encryptionEnabled: {
      type: Boolean,
      default: true
    },
    lastScan: Date,
    threats: [{
      type: String,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      details: String,
      detectedAt: Date
    }]
  },
  settings: {
    autoLock: {
      type: Boolean,
      default: true
    },
    locationTracking: {
      type: Boolean,
      default: true
    },
    remoteWipe: {
      type: Boolean,
      default: true
    }
  },
  performance: {
    cpuUsage: Number,
    memoryUsage: Number,
    storageUsage: Number,
    batteryLevel: Number,
    temperature: Number,
    lastUpdate: Date
  },
  commands: [{
    type: {
      type: String,
      enum: ['lock', 'wipe', 'play_sound', 'optimize']
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    issuedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: Date,
    error: String
  }],
  lastCommand: {
    type: String,
    enum: ['lock', 'wipe', 'play_sound', 'optimize']
  },
  lastCommandTime: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for faster queries
deviceSchema.index({ owner: 1, deviceId: 1 });
deviceSchema.index({ status: 1 });
deviceSchema.index({ 'security.threats.severity': 1 });

// Method to update device status
deviceSchema.methods.updateStatus = async function(status) {
  this.status = status;
  this.lastSeen = new Date();
  await this.save();
};

// Method to add a command
deviceSchema.methods.addCommand = async function(commandType) {
  this.commands.push({
    type: commandType,
    issuedAt: new Date()
  });
  this.lastCommand = commandType;
  this.lastCommandTime = new Date();
  await this.save();
};

// Method to update device performance metrics
deviceSchema.methods.updatePerformance = async function(metrics) {
  this.performance = {
    ...metrics,
    lastUpdate: new Date()
  };
  await this.save();
};

// Method to update device location
deviceSchema.methods.updateLocation = async function(latitude, longitude, accuracy = 10) {
  this.location = {
    latitude,
    longitude,
    accuracy,
    lastUpdated: new Date()
  };
  await this.save();
};

// Method to check if device needs attention
deviceSchema.methods.needsAttention = function() {
  const now = new Date();
  const hoursSinceLastSeen = (now - this.lastSeen) / (1000 * 60 * 60);
  
  return (
    hoursSinceLastSeen > 24 || // Device hasn't been seen in 24 hours
    this.status === 'warning' ||
    (this.performance && this.performance.cpuUsage > 90) || // High CPU usage
    (this.performance && this.performance.memoryUsage > 90) || // High memory usage
    (this.security && this.security.threats.some(t => t.severity === 'high' || t.severity === 'critical'))
  );
};

module.exports = mongoose.model('Device', deviceSchema); 