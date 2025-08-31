const events = [];
let monitoringInterval = null;
let monitoringStatus = {
  isActive: false,
  lastCheck: null,
  activeMonitors: {
    appBehavior: true,
    networkActivity: true,
    permissionChanges: true,
  },
};

const securityEvents = {
  app_scan: [
    {
      message: 'Suspicious app behavior detected',
      details: 'Unusual background activity from com.example.app',
      severity: 'high'
    },
    {
      message: 'New app installation detected',
      details: 'App installed from unknown source',
      severity: 'medium'
    },
    {
      message: 'App permission change detected',
      details: 'Camera permission granted to com.example.app',
      severity: 'medium'
    }
  ],
  network_activity: [
    {
      message: 'Suspicious network connection blocked',
      details: 'Connection attempt to known malicious IP',
      severity: 'high'
    },
    {
      message: 'Unusual data transfer detected',
      details: 'Large data upload to unknown server',
      severity: 'medium'
    },
    {
      message: 'Insecure network connection detected',
      details: 'App attempting to use unencrypted connection',
      severity: 'high'
    }
  ],
  permission_change: [
    {
      message: 'Critical permission change detected',
      details: 'Location permission granted to background service',
      severity: 'high'
    },
    {
      message: 'Permission abuse detected',
      details: 'Multiple permission requests in short time',
      severity: 'medium'
    },
    {
      message: 'System permission modified',
      details: 'App requesting root access',
      severity: 'high'
    }
  ],
  system_alert: [
    {
      message: 'System integrity check failed',
      details: 'Potential root access detected',
      severity: 'high'
    },
    {
      message: 'System configuration changed',
      details: 'Developer options enabled',
      severity: 'medium'
    },
    {
      message: 'Security patch missing',
      details: 'System running outdated security version',
      severity: 'medium'
    }
  ]
};

const generateRandomEvent = () => {
  const eventTypes = Object.keys(securityEvents);
  const selectedType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  const possibleEvents = securityEvents[selectedType];
  const selectedEvent = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];

  return {
    type: selectedType,
    severity: selectedEvent.severity,
    details: {
      message: selectedEvent.message,
      details: selectedEvent.details,
      recommendations: [
        'Review app permissions',
        'Update security settings',
        'Install latest security patches'
      ]
    },
    timestamp: new Date(),
    deviceInfo: {
      batteryLevel: Math.floor(Math.random() * 100),
      networkType: Math.random() > 0.5 ? 'WIFI' : '4G',
      isRooted: false,
      securityPatchLevel: '2024-01'
    }
  };
};

exports.startMonitoring = (req, res) => {
  const { interval = 10000 } = req.body || {};

  if (monitoringStatus.isActive) {
    return res.json({ 
      status: 'already_running', 
      monitoringStatus,
      message: 'Real-time monitoring is already active'
    });
  }

  monitoringStatus.isActive = true;
  monitoringStatus.lastCheck = new Date();
  monitoringStatus.startTime = new Date();
  monitoringStatus.eventsCount = 0;
  monitoringStatus.criticalEvents = 0;

  monitoringInterval = setInterval(() => {
    monitoringStatus.lastCheck = new Date();
    monitoringStatus.eventsCount++;
  }, interval);

  return res.json({
    status: 'started',
    monitoringStatus,
    message: 'Real-time security monitoring activated',
    timestamp: new Date()
  });
};

exports.stopMonitoring = (req, res) => {
  if (!monitoringStatus.isActive) {
    return res.json({
      status: 'already_stopped',
      monitoringStatus,
      message: 'Monitoring is not currently active'
    });
  }

  clearInterval(monitoringInterval);
  monitoringInterval = null;
  monitoringStatus.isActive = false;
  monitoringStatus.lastCheck = new Date();
  monitoringStatus.endTime = new Date();

  return res.json({
    status: 'stopped',
    monitoringStatus,
    message: 'Security monitoring stopped successfully',
    summary: {
      duration: (new Date() - monitoringStatus.startTime) / 1000,
      totalEvents: monitoringStatus.eventsCount,
      criticalEvents: monitoringStatus.criticalEvents
    }
  });
};

exports.getStatus = (req, res) => {
  const status = {
    ...monitoringStatus,
    systemStatus: {
      cpuUsage: Math.floor(Math.random() * 100),
      memoryUsage: Math.floor(Math.random() * 100),
      diskSpace: Math.floor(Math.random() * 100),
      networkLatency: Math.floor(Math.random() * 200)
    },
    threatLevel: monitoringStatus.criticalEvents > 5 ? 'high' : 
                monitoringStatus.criticalEvents > 2 ? 'medium' : 'low',
    lastEvents: events.slice(-3)
  };

  return res.json(status);
};

exports.getEvents = (req, res) => {
  const { limit = 10, severity, type } = req.query;
  let filteredEvents = [...events];

  if (severity) {
    filteredEvents = filteredEvents.filter(event => event.severity === severity);
  }

  if (type) {
    filteredEvents = filteredEvents.filter(event => event.type === type);
  }

  return res.json({
    events: filteredEvents.slice(-limit),
    total: events.length,
    filtered: filteredEvents.length,
    summary: {
      high: filteredEvents.filter(e => e.severity === 'high').length,
      medium: filteredEvents.filter(e => e.severity === 'medium').length,
      low: filteredEvents.filter(e => e.severity === 'low').length
    }
  });
}; 