const express = require('express');
const router = express.Router();

// Get VPN Status
router.get('/status', (req, res) => {
  res.json({
    isEnabled: false,
    currentServer: 'None',
    blockedDomains: [],
    lastUpdated: new Date().toISOString()
  });
});

// Toggle VPN
router.post('/toggle', (req, res) => {
  const { enable } = req.body;
  res.json({
    isEnabled: enable,
    currentServer: enable ? 'US-Server-1' : 'None',
    blockedDomains: [],
    lastUpdated: new Date().toISOString()
  });
});

// Update blocked domains
router.post('/block-domains', (req, res) => {
  const { domains } = req.body;
  res.json({
    isEnabled: true,
    currentServer: 'US-Server-1',
    blockedDomains: domains,
    lastUpdated: new Date().toISOString()
  });
});

module.exports = router; 