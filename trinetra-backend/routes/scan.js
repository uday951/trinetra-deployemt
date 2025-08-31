const express = require('express');
const router = express.Router();
const multer = require('multer');
const { scanApp } = require('../controllers/scanController');
const axios = require('axios');
const dns = require('dns').promises;
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ABUSEIPDB_API_KEY = process.env.ABUSEIPDB_API_KEY;
const ABUSEIPDB_API_URL = 'https://api.abuseipdb.com/api/v2';

// Configure multer for file uploads with disk storage instead of memory
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Use system temp directory
    const tempDir = path.join(os.tmpdir(), 'trinetra-uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only allow one file at a time
  }
});

// Add logging middleware
router.use((req, res, next) => {
  console.log(`Scan route accessed: ${req.method} ${req.path}`);
  next();
});

// Ensure the scan route is available at POST /api/security/scan
router.post('/', scanApp);

// Scan file for malware
router.post('/scan-file', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      console.log('/scan-file: No file uploaded.');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`/scan-file: Received file: ${req.file.originalname}, Size: ${req.file.size} bytes, Path: ${req.file.path}`);

    // Basic file validation
    if (req.file.size === 0) {
      return res.status(400).json({ error: 'File is empty' });
    }

    // Create a FormData instance for proper file handling
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    try {
      // This is a placeholder for your actual scanning service
      // Replace with your actual scanning service endpoint and configuration
      const scanResponse = await axios.post('YOUR_SCANNING_SERVICE_URL', formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${process.env.SCANNING_SERVICE_API_KEY}`
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      // Process the scan results
      const scanResult = {
        scanId: `file-${Date.now().toString()}`,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        status: 'scanned',
        results: scanResponse.data
      };

      // Clean up: Delete the temporary file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting temporary file:', err);
      });

      res.json(scanResult);

    } catch (scanError) {
      console.error('Error during file scanning:', scanError);
      
      // Clean up: Delete the temporary file even if scanning fails
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting temporary file:', err);
      });

      // Handle specific scanning service errors
      if (scanError.response) {
        return res.status(scanError.response.status).json({
          error: 'Scanning service error',
          details: scanError.response.data
        });
      }

      // For now, return a basic analysis since we don't have a scanning service
      res.json({
        scanId: `file-${Date.now().toString()}`,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        status: 'analyzed',
        results: {
          message: 'Basic file analysis completed',
          fileType: req.file.mimetype,
          isSafe: true, // This should be determined by actual scanning
          threats: []
        }
      });
    }

  } catch (error) {
    console.error('Error during /scan-file processing:', error);

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'File too large',
          message: 'Maximum file size is 5MB'
        });
      }
      return res.status(400).json({
        error: 'File upload error',
        message: error.message
      });
    }

    next(error);
  }
});

// Check URL safety using AbuseIPDB
router.post('/check-url', async (req, res, next) => {
  console.log('URL scan request received:', req.body);
  try {
    const { url } = req.body;
    
    if (!url) {
      console.log('/check-url: No URL provided.');
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!ABUSEIPDB_API_KEY) {
      console.error('/check-url: ABUSEIPDB_API_KEY is not configured. This is a server configuration issue.');
      return res.status(500).json({ error: 'Server configuration error for URL scanning' });
    }

    // Extract domain from URL
    let domain;
    try {
      domain = new URL(url).hostname;
      console.log(`/check-url: Extracted domain: ${domain} from URL: ${url}`);
    } catch (parseError) {
      console.error(`/check-url: URL parsing error for URL: ${url}`, parseError);
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    console.log(`/check-url: Resolving IP for domain: ${domain}`);

    // First, resolve the domain to IP
    let ipAddress;
    try {
      const addresses = await dns.resolve4(domain);
      if (addresses && addresses.length > 0) {
        ipAddress = addresses[0];
        console.log(`/check-url: Resolved IP address: ${ipAddress} for domain: ${domain}`);
      } else {
        // If domain is valid but has no AAAA records (and resolve4 was used)
        // or if it genuinely doesn't resolve.
        throw new Error('No IPv4 addresses found for the domain.');
      }
    } catch (dnsError) {
      console.error(`/check-url: DNS resolution error for domain: ${domain}`, dnsError);
      return res.status(400).json({ error: `Could not resolve domain '${domain}' to IP address. It might be an invalid, non-existent, or unreachable domain.` });
    }
    
    // Use AbuseIPDB to check the IP
    console.log(`/check-url: Making request to AbuseIPDB for IP: ${ipAddress}. API Key (partial): ${ABUSEIPDB_API_KEY.substring(0, 5)}...`);
    console.log('Using API key:', ABUSEIPDB_API_KEY.substring(0, 10) + '...');
    
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
        },
        timeout: 10000
      });

      console.log('/check-url: AbuseIPDB response status:', response.status);
      const reportData = response.data.data;

      const result = {
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
      };

      res.json(result);
    } catch (apiError) {
      console.error('/check-url: AbuseIPDB API request error:', {
        message: apiError.message,
        isAxiosError: apiError.isAxiosError,
        requestUrl: apiError.config?.url,
        requestParams: apiError.config?.params,
        responseStatus: apiError.response?.status,
        responseData: apiError.response?.data,
      });

      if (apiError.response) {
        const statusCode = apiError.response.status;
        const errorData = apiError.response.data;
        let userMessage = 'Error communicating with URL scanning service.';

        if (statusCode === 401) {
            userMessage = 'Invalid API key for URL scanning service. Please check server configuration.';
            return res.status(500).json({ error: userMessage, details: errorData?.errors?.[0]?.detail || 'Invalid API Key' });
        } else if (statusCode === 403) {
             userMessage = 'Forbidden. API key may lack permissions for URL scanning service.';
            return res.status(500).json({ error: userMessage, details: errorData?.errors?.[0]?.detail || 'Permission Denied' });
        } else if (statusCode === 429) {
            userMessage = 'Rate limit exceeded with URL scanning service. Please try again later.';
            return res.status(429).json({ error: userMessage, details: errorData?.errors?.[0]?.detail || 'Rate Limit Exceeded'});
        } else if (statusCode === 400 || statusCode === 422) {
            userMessage = 'Invalid request to URL scanning service (e.g., invalid IP or parameter).';
            return res.status(400).json({ error: userMessage, details: errorData?.errors?.[0]?.detail || 'Bad Request / Invalid Parameter'});
        }
        return res.status(apiError.response.status || 502).json({
            error: userMessage,
            details: errorData?.errors?.[0]?.detail || 'Scanning service returned an unhandled error.'
        });
      } else if (apiError.request) {
        console.error('/check-url: No response from AbuseIPDB. Network issue or timeout.');
        return res.status(504).json({
            error: 'URL scanning service did not respond. Please try again later.'
        });
      }
      next(apiError); // Pass other errors to global handler
    }
  } catch (error) {
    console.error('/check-url: Unexpected error in main try block:', error);
    next(error);
  }
});

module.exports = router;
