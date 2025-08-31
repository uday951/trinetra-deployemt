import express, { Request, Response } from 'express';
import multer from 'multer';
import axios from 'axios';
import { config } from 'dotenv';
import dns from 'dns/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { Router } from 'express';
import SecurityMonitorService from '../../services/securityMonitor';

const execAsync = promisify(exec);

config();

const router = express.Router();
const ABUSEIPDB_API_KEY = process.env.ABUSEIPDB_API_KEY;
const ABUSEIPDB_API_URL = 'https://api.abuseipdb.com/api/v2';
const securityMonitor = SecurityMonitorService.getInstance();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.android.package-archive' || 
        file.originalname.endsWith('.apk')) {
      cb(null, true);
    } else {
      cb(new Error('Only APK files are allowed'));
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024 // Increased to 100MB limit
  }
});

// Scan APK file
router.post('/scan-file', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Basic APK analysis
    const apkPath = req.file.path;
    const analysisResult = {
      fileName: req.file.originalname,
      fileSize: req.file.size,
      scanDate: new Date().toISOString(),
      permissions: [] as string[],
      securityIssues: [] as string[],
      riskLevel: 'Unknown' as 'Safe' | 'Low' | 'Medium' | 'High',
      details: ''
    };

    try {
      // Basic file analysis
      const fileSizeMB = req.file.size / (1024 * 1024);
      
      // Check file size
      if (fileSizeMB > 50) {
        analysisResult.securityIssues.push('Large APK file size (>50MB) - Could indicate bundled resources or potential bloatware');
      }

      // Check file extension
      if (!req.file.originalname.toLowerCase().endsWith('.apk')) {
        analysisResult.securityIssues.push('File extension mismatch - File should have .apk extension');
      }

      // Check for common APK file signatures
      const fileBuffer = fs.readFileSync(apkPath);
      const isZipFile = fileBuffer[0] === 0x50 && fileBuffer[1] === 0x4B; // PK header for ZIP files
      
      if (!isZipFile) {
        analysisResult.securityIssues.push('Invalid APK format - File does not appear to be a valid APK/ZIP archive');
      }

      // Determine risk level based on findings
      if (analysisResult.securityIssues.length > 2) {
        analysisResult.riskLevel = 'High';
        analysisResult.details = 'Multiple security concerns detected. Exercise extreme caution.';
      } else if (analysisResult.securityIssues.length > 0) {
        analysisResult.riskLevel = 'Medium';
        analysisResult.details = 'Some security concerns detected. Review carefully.';
      } else {
        analysisResult.riskLevel = 'Safe';
        analysisResult.details = 'No immediate security concerns detected.';
      }

      // Add general security recommendations
      analysisResult.details += '\n\nRecommendations:\n' +
        '1. Only install APKs from trusted sources\n' +
        '2. Verify the app developer and publisher\n' +
        '3. Check app reviews and ratings\n' +
        '4. Review app permissions after installation\n' +
        '5. Keep your device and apps updated';

      // Clean up uploaded file
      fs.unlink(apkPath, (err) => {
        if (err) console.error('Error deleting temporary file:', err);
      });

      res.json(analysisResult);
    } catch (error: any) {
      console.error('Error analyzing APK:', error);
      
      // Clean up uploaded file even if analysis fails
      fs.unlink(apkPath, (err) => {
        if (err) console.error('Error deleting temporary file:', err);
      });

      throw error;
    }
  } catch (error: any) {
    console.error('Error scanning file:', error);
    
    // Handle specific error types
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File too large',
        details: 'The file size exceeds the maximum limit of 100MB'
      });
    }
    
    res.status(500).json({ 
      error: 'Error scanning file',
      details: error.message
    });
  }
});

// Check URL safety using AbuseIPDB
router.post('/check-url', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!ABUSEIPDB_API_KEY) {
      console.error('ABUSEIPDB_API_KEY is not configured');
      return res.status(500).json({ 
        error: 'Server configuration error',
        details: 'AbuseIPDB API key is not configured'
      });
    }

    // Extract domain from URL
    let domain;
    try {
      domain = new URL(url).hostname;
      console.log(`Extracted domain: ${domain} from URL: ${url}`);
    } catch (parseError) {
      console.error(`URL parsing error for URL: ${url}`, parseError);
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Resolve domain to IP
    let ipAddress;
    try {
      const addresses = await dns.resolve4(domain);
      if (addresses && addresses.length > 0) {
        ipAddress = addresses[0];
        console.log(`Resolved IP address: ${ipAddress} for domain: ${domain}`);
      } else {
        throw new Error('No IPv4 addresses found for the domain.');
      }
    } catch (dnsError) {
      console.error(`DNS resolution error for domain: ${domain}`, dnsError);
      return res.status(400).json({ 
        error: `Could not resolve domain '${domain}' to IP address. It might be an invalid, non-existent, or unreachable domain.`
      });
    }

    // Check IP with AbuseIPDB
    try {
      const response = await axios.get(`${ABUSEIPDB_API_URL}/check`, {
        params: {
          ipAddress: ipAddress,
          maxAgeInDays: 90,
          verbose: true
        },
        headers: {
          'Key': ABUSEIPDB_API_KEY,
          'Accept': 'application/json'
        }
      });

      const reportData = response.data.data;
      
      res.json({
        scanId: `url-${Date.now().toString()}`,
        requestedUrl: url,
        domain: reportData.domain || domain,
        ipAddress: reportData.ipAddress || ipAddress,
        abuseConfidenceScore: reportData.abuseConfidenceScore,
        countryCode: reportData.countryCode,
        isp: reportData.isp,
        usageType: reportData.usageType,
        totalReports: reportData.totalReports,
        numDistinctUsers: reportData.numDistinctUsers,
        lastReportedAt: reportData.lastReportedAt,
        isPublic: reportData.isPublic,
        isWhitelisted: reportData.isWhitelisted,
        status: 'success',
        securitySummary: {
          isMalicious: reportData.abuseConfidenceScore > 75,
          riskLevel: reportData.abuseConfidenceScore > 75 ? 'High' :
                     reportData.abuseConfidenceScore > 50 ? 'Medium' :
                     reportData.abuseConfidenceScore > 25 ? 'Low' : 'Minimal/Safe',
          recommendation: reportData.abuseConfidenceScore > 25 ? 'Caution advised' : 'Appears safe'
        }
      });
    } catch (abuseError: any) {
      console.error('AbuseIPDB API error:', abuseError.response?.data || abuseError.message);
      
      if (abuseError.response?.status === 429) {
        return res.status(500).json({
          error: 'AbuseIPDB API error',
          details: 'API rate limit exceeded. Please try again later.'
        });
      }

      throw abuseError;
    }
  } catch (error: any) {
    console.error('Error checking URL:', error);
    res.status(500).json({ 
      error: 'Error checking URL',
      details: error.response?.data?.message || error.message
    });
  }
});

// Get scan history
router.get('/scan-history', async (req: Request, res: Response) => {
  try {
    // In a real implementation, this would fetch from a database
    res.json({
      history: []
    });
  } catch (error) {
    console.error('Error fetching scan history:', error);
    res.status(500).json({ error: 'Error fetching scan history' });
  }
});

// Security Monitoring Routes
router.post('/monitor/start', (req: Request, res: Response) => {
  try {
    const { interval } = req.body;
    securityMonitor.startMonitoring(interval);
    res.json({ 
      status: 'success',
      message: 'Monitoring started',
      monitoringStatus: securityMonitor.getMonitoringStatus() 
    });
  } catch (error) {
    console.error('Error starting monitoring:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to start monitoring',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/monitor/stop', (req: Request, res: Response) => {
  try {
    securityMonitor.stopMonitoring();
    res.json({ 
      status: 'success',
      message: 'Monitoring stopped',
      monitoringStatus: securityMonitor.getMonitoringStatus() 
    });
  } catch (error) {
    console.error('Error stopping monitoring:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to stop monitoring',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/monitor/status', (req: Request, res: Response) => {
  try {
    const status = securityMonitor.getMonitoringStatus();
    res.json({ 
      status: 'success',
      data: status 
    });
  } catch (error) {
    console.error('Error getting monitoring status:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to get monitoring status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/monitor/events', (req: Request, res: Response) => {
  try {
    const events = securityMonitor.getSecurityEvents();
    res.json({ 
      status: 'success',
      data: events 
    });
  } catch (error) {
    console.error('Error getting security events:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to get security events',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 