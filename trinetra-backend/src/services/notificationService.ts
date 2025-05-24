import { ISOSContact } from '../models/SOSContact';
import twilio from 'twilio';

class NotificationService {
  private twilioClient: twilio.Twilio | null = null;
  private twilioPhoneNumber: string | null = null;

  constructor() {
    // Initialize Twilio client if credentials are available
    const accountSid = process.env.TWILIO_ACCOUNT_SID || null;
    const authToken = process.env.TWILIO_AUTH_TOKEN || null;
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER || null;

    if (accountSid && authToken && phoneNumber) {
      this.twilioClient = twilio(accountSid, authToken);
      this.twilioPhoneNumber = phoneNumber;
      console.log('Twilio client initialized successfully');
    } else {
      console.warn('Twilio credentials not found. SMS notifications will be logged only.');
      if (!accountSid) console.warn('Missing TWILIO_ACCOUNT_SID');
      if (!authToken) console.warn('Missing TWILIO_AUTH_TOKEN');
      if (!phoneNumber) console.warn('Missing TWILIO_PHONE_NUMBER');
    }
  }

  async sendSOS(contacts: ISOSContact[], message: string): Promise<void> {
    for (const contact of contacts) {
      try {
        if (this.twilioClient && this.twilioPhoneNumber && contact.phone) {
          // Format phone number to E.164 format if not already
          const toNumber = this.formatPhoneNumber(contact.phone);
          
          // Send actual SMS via Twilio
          await this.twilioClient.messages.create({
            body: message,
            to: toNumber,
            from: this.twilioPhoneNumber
          });
          console.log(`SOS SMS sent successfully to ${toNumber}`);
        } else {
          // Fallback to logging
          console.log(`[MOCK] Sending SOS to ${contact.phone || contact.email}: ${message}`);
        }
      } catch (error) {
        console.error(`Failed to send SOS to ${contact.phone}:`, error);
      }
    }
  }

  private formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // If it doesn't start with '+', assume it's an Indian number and add +91
    if (!phone.startsWith('+')) {
      // If it starts with '91', just add '+'
      if (digits.startsWith('91')) {
        return '+' + digits;
      }
      // Otherwise, add '+91'
      return '+91' + digits;
    }
    
    return phone;
  }
}

export const notificationService = new NotificationService(); 