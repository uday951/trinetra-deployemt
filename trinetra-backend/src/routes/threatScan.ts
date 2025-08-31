import { Router, Request, Response } from 'express';

const router = Router();

interface App {
  packageName: string;
  [key: string]: any;
}

interface ScanResult {
  packageName: string;
  isMalicious: boolean;
  threats: string[];
  scanTimestamp: string;
}

// Scan multiple apps
router.post('/scan', async (req: Request, res: Response) => {
  try {
    const { apps } = req.body as { apps: App[] };
    const results: ScanResult[] = apps.map((app) => ({
      packageName: app.packageName,
      isMalicious: false,
      threats: [],
      scanTimestamp: new Date().toISOString()
    }));
    
    res.json({ results });
  } catch (error) {
    console.error('Error scanning apps:', error);
    res.status(500).json({ error: 'Failed to scan apps' });
  }
});

// Scan single app
router.post('/scan/single', async (req: Request, res: Response) => {
  try {
    const { app } = req.body as { app: App };
    const result: ScanResult = {
      packageName: app.packageName,
      isMalicious: false,
      threats: [],
      scanTimestamp: new Date().toISOString()
    };
    
    res.json({ result });
  } catch (error) {
    console.error('Error scanning app:', error);
    res.status(500).json({ error: 'Failed to scan app' });
  }
});

export default router; 