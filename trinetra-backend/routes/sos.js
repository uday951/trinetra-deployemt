const express = require('express');
const router = express.Router();
const SOSContact = require('../src/models/SOSContact');
const notificationService = require('../src/services/notificationService');

// Get all contacts for a user (simplified route)
router.get('/contacts', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'Missing userId parameter' });
    }
    const contacts = await SOSContact.find({ userId });
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching SOS contacts:', error);
    res.status(500).json({ message: 'Failed to fetch contacts' });
  }
});

// Add SOS contact
router.post('/contacts', async (req, res) => {
  try {
    const { userId, name, phone, email } = req.body;
    if (!userId || !name || !phone) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const contact = await SOSContact.create({ userId, name, phone, email });
    res.json(contact);
  } catch (error) {
    console.error('Error adding SOS contact:', error);
    res.status(500).json({ message: 'Failed to add contact' });
  }
});

// Delete SOS contact
router.delete('/contacts/:id', async (req, res) => {
  try {
    const contact = await SOSContact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting SOS contact:', error);
    res.status(500).json({ message: 'Failed to delete contact' });
  }
});

// Trigger SOS
router.post('/trigger', async (req, res) => {
  try {
    const { userId, message } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'Missing userId' });
    }
    const contacts = await SOSContact.find({ userId });
    await notificationService.sendSOS(contacts, message || 'Emergency! Please help!');
    res.json({ success: true });
  } catch (error) {
    console.error('Error triggering SOS:', error);
    res.status(500).json({ message: 'Failed to trigger SOS' });
  }
});

module.exports = router; 