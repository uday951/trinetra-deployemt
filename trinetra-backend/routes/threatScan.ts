import { Router } from 'express';
import ThreatScannerService from '../services/threatScanner';

const router = Router();

router.post('/scan', async (req, res) => {
  try {
    const apps = req.body.apps;
    if (!Array.isArray(apps)) {
      return res.status(400).json({ error: 'Invalid request format. Expected array of apps.' });
    }

    const threatScanner = ThreatScannerService.getInstance();
    const results = await threatScanner.bulkScan(apps);

    return res.json({
      success: true,
      results,
      scannedAt: new Date(),
    });
  } catch (error) {
    console.error('Error during threat scan:', error);
    return res.status(500).json({ error: 'Failed to perform threat scan' });
  }
});

router.post('/scan/single', async (req, res) => {
  try {
    const app = req.body.app;
    if (!app || !app.packageName) {
      return res.status(400).json({ error: 'Invalid request format. Expected app data.' });
    }

    const threatScanner = ThreatScannerService.getInstance();
    const result = await threatScanner.scanApp(app);

    return res.json({
      success: true,
      result,
      scannedAt: new Date(),
    });
  } catch (error) {
    console.error('Error during single app threat scan:', error);
    return res.status(500).json({ error: 'Failed to perform threat scan' });
  }
});

export default router; 