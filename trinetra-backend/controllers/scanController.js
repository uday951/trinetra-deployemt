// controllers/scanController.js
const axios = require('axios');
const crypto = require('crypto');

// VirusTotal API configuration
const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;
const VIRUSTOTAL_API = 'https://www.virustotal.com/vtapi/v2';

// Common malicious permissions that apps shouldn't normally request
const SUSPICIOUS_PERMISSIONS = [
  'android.permission.READ_SMS',
  'android.permission.SEND_SMS',
  'android.permission.RECEIVE_SMS',
  'android.permission.RECORD_AUDIO',
  'android.permission.CAMERA',
  'android.permission.READ_CONTACTS',
  'android.permission.READ_CALL_LOG',
  'android.permission.READ_PHONE_STATE',
  'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.SYSTEM_ALERT_WINDOW',
  'android.permission.GET_ACCOUNTS',
];

exports.scanApp = async (req, res) => {
  const { packageName, permissions = [], appHash } = req.body;

  try {
    // Initialize scan results
    let scanResults = {
      packageName,
      status: 'scanning',
      details: 'Analyzing application security...',
      scan_results: {
        risk_level: 'Unknown',
        suspicious_permissions: [],
        detection_count: { malicious: 0, harmless: 0 },
        analysis: []
      }
    };

    // 1. Permission Analysis
    const suspiciousPermissions = permissions.filter(
      perm => SUSPICIOUS_PERMISSIONS.includes(perm)
    );

    // 2. Hash/Signature Check (if provided)
    if (appHash) {
      try {
        const vtResponse = await axios.get(`${VIRUSTOTAL_API}/file/report`, {
          params: {
            apikey: VIRUSTOTAL_API_KEY,
            resource: appHash
          }
        });

        if (vtResponse.data.response_code === 1) {
          scanResults.scan_results.detection_count = {
            malicious: vtResponse.data.positives,
            harmless: vtResponse.data.total - vtResponse.data.positives
          };

          // Add detailed scan results
          Object.entries(vtResponse.data.scans).forEach(([scanner, result]) => {
            scanResults.scan_results.analysis.push({
              scanner,
              detected: result.detected,
              result: result.result || 'clean'
            });
          });
        }
      } catch (error) {
        console.error('VirusTotal API error:', error.message);
      }
    }

    // 3. Risk Assessment
    const permissionRiskScore = (suspiciousPermissions.length / SUSPICIOUS_PERMISSIONS.length) * 100;
    const vtRiskScore = scanResults.scan_results.detection_count.malicious > 0 
      ? (scanResults.scan_results.detection_count.malicious / scanResults.scan_results.detection_count.harmless) * 100
      : 0;

    const totalRiskScore = (permissionRiskScore + vtRiskScore) / 2;

    // 4. Final Risk Evaluation
    if (totalRiskScore >= 70) {
      scanResults.status = 'danger';
      scanResults.scan_results.risk_level = 'Critical';
      scanResults.details = 'High-risk security threats detected';
    } else if (totalRiskScore >= 40) {
      scanResults.status = 'warning';
      scanResults.scan_results.risk_level = 'Medium';
      scanResults.details = 'Potential security risks identified';
    } else {
      scanResults.status = 'safe';
      scanResults.scan_results.risk_level = 'Low';
      scanResults.details = 'No significant security threats detected';
    }

    // Add suspicious permissions to results
    scanResults.scan_results.suspicious_permissions = suspiciousPermissions;

    // Add timestamp
    scanResults.scan_results.scan_date = new Date().toISOString();

    res.json(scanResults);
  } catch (error) {
    console.error("Scan error:", error.message);
    res.status(500).json({
      packageName,
      status: 'warning',
      details: 'Scan failed - Unable to complete security analysis',
      error: error.message
    });
  }
};
