const express = require('express');
const axios = require('axios');
const router = express.Router();

// NumVerify API configuration
const NUMVERIFY_API_KEY = process.env.NUMVERIFY_API_KEY || 'a4f524e4e5a36b4301c83fc3f49bb65a';
const NUMVERIFY_BASE_URL = 'http://apilayer.net/api';

// In-memory storage for blocked/allowed numbers (use database in production)
const blockedNumbers = new Set();
const allowedNumbers = new Set();

// Check if a phone number is spam
router.post('/check', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    
    // Check local block/allow lists first
    if (allowedNumbers.has(cleanNumber)) {
      return res.json({
        isSpam: false,
        riskLevel: 'low',
        reason: 'Number is whitelisted',
        phoneInfo: null
      });
    }

    if (blockedNumbers.has(cleanNumber)) {
      return res.json({
        isSpam: true,
        riskLevel: 'high',
        reason: 'Number is blacklisted',
        phoneInfo: null
      });
    }

    // Check with NumVerify API
    const response = await axios.get(`${NUMVERIFY_BASE_URL}/validate`, {
      params: {
        access_key: NUMVERIFY_API_KEY,
        number: cleanNumber,
        format: 1
      }
    });

    const phoneInfo = response.data;
    
    if (!phoneInfo.valid) {
      return res.json({
        isSpam: true,
        riskLevel: 'high',
        reason: 'Invalid or unverifiable number',
        phoneInfo: null
      });
    }

    // Analyze spam risk
    const spamAnalysis = analyzeSpamRisk(phoneInfo);
    
    res.json({
      ...spamAnalysis,
      phoneInfo
    });

  } catch (error) {
    console.error('Spam check error:', error);
    res.status(500).json({ 
      error: 'Failed to check phone number',
      isSpam: false,
      riskLevel: 'low',
      reason: 'Service unavailable'
    });
  }
});

// Block a phone number
router.post('/block', (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    blockedNumbers.add(cleanNumber);
    allowedNumbers.delete(cleanNumber);
    
    res.json({ 
      success: true, 
      message: `${phoneNumber} has been blocked` 
    });
  } catch (error) {
    console.error('Block number error:', error);
    res.status(500).json({ error: 'Failed to block number' });
  }
});

// Allow a phone number
router.post('/allow', (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    allowedNumbers.add(cleanNumber);
    blockedNumbers.delete(cleanNumber);
    
    res.json({ 
      success: true, 
      message: `${phoneNumber} has been whitelisted` 
    });
  } catch (error) {
    console.error('Allow number error:', error);
    res.status(500).json({ error: 'Failed to allow number' });
  }
});

// Get blocked numbers
router.get('/blocked', (req, res) => {
  res.json({ blockedNumbers: Array.from(blockedNumbers) });
});

// Get allowed numbers
router.get('/allowed', (req, res) => {
  res.json({ allowedNumbers: Array.from(allowedNumbers) });
});

// Analyze spam risk based on phone info
function analyzeSpamRisk(phoneInfo) {
  let riskScore = 0;
  const reasons = [];

  // Check line type
  if (phoneInfo.line_type === 'mobile') {
    riskScore += 1;
  } else if (phoneInfo.line_type === 'landline') {
    riskScore += 2;
  } else {
    riskScore += 3;
    reasons.push('Unknown line type');
  }

  // Check carrier
  const suspiciousCarriers = ['voip', 'virtual', 'prepaid'];
  if (suspiciousCarriers.some(carrier => 
    phoneInfo.carrier?.toLowerCase().includes(carrier))) {
    riskScore += 2;
    reasons.push('Suspicious carrier');
  }

  // Check if number is from high-risk location
  const highRiskCountries = ['IN', 'PK', 'BD', 'NG', 'GH'];
  if (highRiskCountries.includes(phoneInfo.country_code)) {
    riskScore += 2;
    reasons.push('High-risk location');
  }

  // Determine risk level
  let riskLevel, isSpam;
  
  if (riskScore >= 5) {
    riskLevel = 'high';
    isSpam = true;
  } else if (riskScore >= 3) {
    riskLevel = 'medium';
    isSpam = true;
  } else {
    riskLevel = 'low';
    isSpam = false;
  }

  return {
    isSpam,
    riskLevel,
    reason: reasons.length > 0 ? reasons.join(', ') : 'Number appears legitimate'
  };
}

module.exports = router;