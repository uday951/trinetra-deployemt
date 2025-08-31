const express = require('express');
const router = express.Router();

const {
  startMonitoring,
  stopMonitoring,
  getStatus,
  getEvents,
} = require('../controllers/monitorController');

// POST /security/monitor/start
router.post('/start', startMonitoring);

// POST /security/monitor/stop
router.post('/stop', stopMonitoring);

// GET /security/monitor/status
router.get('/status', getStatus);

// GET /security/monitor/events
router.get('/events', getEvents);

module.exports = router; 