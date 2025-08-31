const express = require('express');
const router = express.Router();
const realTimeScanner = require('../services/realTimeScanner');

// Real-time app scanning endpoint
router.post('/scan-app', async (req, res) => {
  try {
    const { packageName, hash, permissions } = req.body;
    
    if (!packageName) {
      return res.status(400).json({ 
        error: 'Package name is required' 
      });
    }

    console.log(`🔍 Scanning app: ${packageName}`);
    
    const scanResult = await realTimeScanner.scanApp({
      packageName,
      hash,
      permissions: permissions || []
    });

    res.json({
      success: true,
      result: scanResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('App scan error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to scan app',
      message: error.message
    });
  }
});

// Bulk scan multiple apps
router.post('/bulk-scan', async (req, res) => {
  try {
    console.log('Bulk scan endpoint hit');
    const { apps } = req.body;
    
    if (!apps || !Array.isArray(apps)) {
      console.log('Invalid apps array:', apps);
      return res.status(400).json({ 
        error: 'Apps array is required' 
      });
    }

    console.log(`🔍 Bulk scanning ${apps.length} apps`);
    console.log('First app:', apps[0]);
    
    const scanResults = await realTimeScanner.bulkScanApps(apps);
    console.log('Scan completed, results:', scanResults.length);
    
    // Calculate summary
    const summary = {
      total: scanResults.length,
      malicious: scanResults.filter(r => r.threatLevel === 'malicious').length,
      suspicious: scanResults.filter(r => r.threatLevel === 'suspicious').length,
      clean: scanResults.filter(r => r.threatLevel === 'clean').length,
      errors: scanResults.filter(r => r.threatLevel === 'error').length
    };

    res.json({
      success: true,
      summary,
      results: scanResults,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Bulk scan error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bulk scan apps',
      message: error.message
    });
  }
});

// Check URL safety
router.post('/check-url', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        error: 'URL is required' 
      });
    }

    console.log(`🔍 Checking URL: ${url}`);
    
    const urlResult = await realTimeScanner.checkURL(url);

    res.json({
      success: true,
      result: urlResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('URL check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check URL',
      message: error.message
    });
  }
});

// Get device security score
router.post('/security-score', async (req, res) => {
  try {
    const { installedApps } = req.body;
    
    if (!installedApps || !Array.isArray(installedApps)) {
      return res.status(400).json({ 
        error: 'Installed apps array is required' 
      });
    }

    console.log(`🔍 Calculating security score for ${installedApps.length} apps`);
    
    const securityScore = await realTimeScanner.getDeviceSecurityScore(installedApps);

    res.json({
      success: true,
      securityScore,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Security score error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate security score',
      message: error.message
    });
  }
});

// Scan file hash
router.post('/scan-hash', async (req, res) => {
  try {
    const { hash } = req.body;
    
    if (!hash) {
      return res.status(400).json({ 
        error: 'File hash is required' 
      });
    }

    console.log(`🔍 Scanning file hash: ${hash.substring(0, 8)}...`);
    
    const scanResult = await realTimeScanner.scanFileHash(hash);

    res.json({
      success: true,
      result: scanResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Hash scan error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to scan file hash',
      message: error.message
    });
  }
});

// Get scanner status and API limits
router.get('/status', (req, res) => {
  res.json({
    success: true,
    status: {
      virusTotalConfigured: !!process.env.VIRUSTOTAL_API_KEY,
      googleSafeBrowsingConfigured: !!process.env.GOOGLE_SAFE_BROWSING_API_KEY,
      rateLimit: {
        virusTotal: '4 requests/minute (Free tier)',
        googleSafeBrowsing: '10,000 requests/day'
      },
      features: [
        'Real-time app scanning',
        'File hash analysis',
        'URL safety checking',
        'Bulk app scanning',
        'Device security scoring'
      ]
    },
    timestamp: new Date().toISOString()
  });
});

// Simple test endpoint
router.get('/test', (req, res) => {
  console.log('Real-time security test endpoint hit');
  res.json({
    success: true,
    message: 'Real-time security API is working',
    timestamp: new Date().toISOString()
  });
});

// Real-time threat monitoring (WebSocket would be better, but this works for now)
router.get('/monitor', async (req, res) => {
  try {
    // This would typically be a WebSocket connection
    // For now, return current threat status
    res.json({
      success: true,
      monitoring: {
        active: true,
        lastScan: new Date().toISOString(),
        threatsDetected: 0,
        status: 'All systems secure'
      }
    });
  } catch (error) {
    console.error('Monitor error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get monitoring status'
    });
  }
});

module.exports = router;