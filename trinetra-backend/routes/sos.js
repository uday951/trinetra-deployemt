const express = require('express');
const router = express.Router();
const SOSContact = require('../models/SOSContact');

// Get all SOS contacts for a user
router.get('/contacts', async (req, res) => {
  try {
    const contacts = await SOSContact.find({ user: req.user._id })
      .sort({ priority: 1 });
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching SOS contacts:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Error fetching SOS contacts'
    });
  }
});

// Add a new SOS contact
router.post('/contacts', async (req, res) => {
  try {
    const { name, phone, email, relationship, priority } = req.body;
    
    const contact = new SOSContact({
      name,
      phone,
      email,
      relationship,
      priority,
      user: req.user._id
    });

    await contact.save();
    res.status(201).json(contact);
  } catch (error) {
    console.error('Error adding SOS contact:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Error adding SOS contact'
    });
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

// Send SOS alert
router.post('/alert', async (req, res) => {
  try {
    const { location } = req.body;
    
    // Get user's SOS contacts
    const contacts = await SOSContact.find({ user: req.user._id })
      .sort({ priority: 1 });

    if (!contacts.length) {
      return res.status(400).json({
        error: 'No contacts',
        message: 'No SOS contacts found'
      });
    }

    // TODO: Implement actual alert sending logic here
    // This could involve sending SMS, email, or push notifications

    res.json({
      success: true,
      message: 'SOS alert sent successfully',
      notifiedContacts: contacts.length
    });
  } catch (error) {
    console.error('Error sending SOS alert:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Error sending SOS alert'
    });
  }
});

module.exports = router; 