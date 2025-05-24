import express, { Request, Response } from 'express';
import WebSocket from 'ws';

const router = express.Router();

// In-memory store for alerts (in production, use a database)
const alerts: any[] = [];
const alertSubscribers = new Set<WebSocket>();

// Helper function to send alert to all subscribers
const broadcastAlert = (alert: any) => {
  alertSubscribers.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(alert));
    }
  });
};

// Create a new alert
router.post('/create', async (req: Request, res: Response) => {
  try {
    const { type, severity, message, source, timestamp } = req.body;
    
    if (!type || !severity || !message) {
      return res.status(400).json({ error: 'Type, severity, and message are required' });
    }

    const alert = {
      id: Date.now().toString(),
      type,
      severity,
      message,
      source,
      timestamp: timestamp || new Date().toISOString(),
      status: 'new'
    };

    alerts.push(alert);
    broadcastAlert(alert);

    res.json({
      status: 'alert created',
      alert
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// Get all alerts
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, severity, type } = req.query;
    
    let filteredAlerts = [...alerts];

    if (status) {
      filteredAlerts = filteredAlerts.filter(alert => alert.status === status);
    }
    
    if (severity) {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
    }
    
    if (type) {
      filteredAlerts = filteredAlerts.filter(alert => alert.type === type);
    }

    res.json({
      alerts: filteredAlerts
    });
  } catch (error) {
    console.error('Error getting alerts:', error);
    res.status(500).json({ error: 'Failed to get alerts' });
  }
});

// Update alert status
router.patch('/:alertId', async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const alert = alerts.find(a => a.id === alertId);
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    alert.status = status;
    alert.updatedAt = new Date().toISOString();

    broadcastAlert({
      ...alert,
      type: 'alert_update'
    });

    res.json({
      status: 'alert updated',
      alert
    });
  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

// Delete alert
router.delete('/:alertId', async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    const alertIndex = alerts.findIndex(a => a.id === alertId);
    
    if (alertIndex === -1) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    const [deletedAlert] = alerts.splice(alertIndex, 1);

    broadcastAlert({
      ...deletedAlert,
      type: 'alert_deleted'
    });

    res.json({
      status: 'alert deleted',
      alert: deletedAlert
    });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

// Subscribe to real-time alerts
router.get('/subscribe', (req: Request, res: Response) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  };
  
  res.writeHead(200, headers);

  const clientId = Date.now();
  const newClient = {
    id: clientId,
    res
  };

  req.on('close', () => {
    alertSubscribers.delete(newClient as any);
  });

  alertSubscribers.add(newClient as any);
});

// Get alert statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = {
      total: alerts.length,
      bySeverity: alerts.reduce((acc: any, alert) => {
        acc[alert.severity] = (acc[alert.severity] || 0) + 1;
        return acc;
      }, {}),
      byStatus: alerts.reduce((acc: any, alert) => {
        acc[alert.status] = (acc[alert.status] || 0) + 1;
        return acc;
      }, {}),
      byType: alerts.reduce((acc: any, alert) => {
        acc[alert.type] = (acc[alert.type] || 0) + 1;
        return acc;
      }, {})
    };

    res.json(stats);
  } catch (error) {
    console.error('Error getting alert stats:', error);
    res.status(500).json({ error: 'Failed to get alert statistics' });
  }
});

export default router; 