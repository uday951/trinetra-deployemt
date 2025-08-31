import { TWILIO_CONFIG } from '../config/env';

const { accountSid, authToken, phoneNumber: twilioPhoneNumber } = TWILIO_CONFIG;

const twilioBaseUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}`;
const messagesUrl = `${twilioBaseUrl}/Messages.json`;
const callsUrl = `${twilioBaseUrl}/Calls.json`;

export interface TwilioMessage {
  to: string;
  body: string;
}

// Function to format phone number to E.164 format
const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If the number starts with '91' (India country code), keep it
  // Otherwise, add '91' as the country code
  if (digits.startsWith('91')) {
    return `+${digits}`;
  } else {
    return `+91${digits}`;
  }
};

// Function to check if a number is verified
const isNumberVerified = async (phone: string): Promise<boolean> => {
  try {
    const formattedNumber = formatPhoneNumber(phone);
    const response = await fetch(`${messagesUrl}?To=${formattedNumber}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      // If the error is about unverified number, return false
      if (errorData.message?.includes('unverified')) {
        return false;
      }
      throw new Error(errorData.message || response.statusText);
    }

    return true;
  } catch (error) {
    console.error('Error checking number verification:', error);
    return false;
  }
};

export const sendSOSMessage = async (to: string, message: string): Promise<boolean> => {
  try {
    const formattedNumber = formatPhoneNumber(to);
    console.log('Sending SMS to:', formattedNumber);

    // Check if the number is verified
    const isVerified = await isNumberVerified(to);
    if (!isVerified) {
      throw new Error(
        `Phone number ${formattedNumber} is not verified. Please verify this number in your Twilio console first. ` +
        'Visit: https://www.twilio.com/console/phone-numbers/verified'
      );
    }

    const formData = new FormData();
    formData.append('To', formattedNumber);
    formData.append('From', twilioPhoneNumber);
    formData.append('Body', message);

    const response = await fetch(messagesUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Twilio API error: ${errorData.message || response.statusText}`);
    }

    const result = await response.json();
    console.log('SMS sent successfully:', result.sid);
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};

export const makeSOSCall = async (to: string): Promise<boolean> => {
  try {
    const formattedNumber = formatPhoneNumber(to);
    console.log('Making call to:', formattedNumber);

    // Check if the number is verified
    const isVerified = await isNumberVerified(to);
    if (!isVerified) {
      throw new Error(
        `Phone number ${formattedNumber} is not verified. Please verify this number in your Twilio console first. ` +
        'Visit: https://www.twilio.com/console/phone-numbers/verified'
      );
    }

    const formData = new FormData();
    formData.append('To', formattedNumber);
    formData.append('From', twilioPhoneNumber);
    // Using TwiML for the call
    formData.append('Twiml', '<Response><Say>This is an emergency SOS call.</Say></Response>');

    const response = await fetch(callsUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Twilio API error: ${errorData.message || response.statusText}`);
    }

    const result = await response.json();
    console.log('Call initiated successfully:', result.sid);
    return true;
  } catch (error) {
    console.error('Error making call:', error);
    throw error;
  }
};

export const sendBulkSOSMessages = async (contacts: Array<{ phone: string; name: string }>, message: string): Promise<boolean> => {
  try {
    // Check all numbers first
    const verificationChecks = await Promise.all(
      contacts.map(async contact => {
        const isVerified = await isNumberVerified(contact.phone);
        return { contact, isVerified };
      })
    );

    // Filter out unverified numbers
    const unverifiedNumbers = verificationChecks
      .filter(check => !check.isVerified)
      .map(check => formatPhoneNumber(check.contact.phone));

    if (unverifiedNumbers.length > 0) {
      throw new Error(
        `The following numbers are not verified: ${unverifiedNumbers.join(', ')}. ` +
        'Please verify these numbers in your Twilio console first. ' +
        'Visit: https://www.twilio.com/console/phone-numbers/verified'
      );
    }

    // Send messages to verified numbers
    const promises = contacts.map(contact => 
      sendSOSMessage(contact.phone, `SOS Alert from ${contact.name}: ${message}`)
    );

    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error('Error sending bulk SMS:', error);
    throw error;
  }
};

export const triggerSOS = async (contacts: Array<{ phone: string; name: string }>): Promise<boolean> => {
  try {
    // Check all numbers first
    const verificationChecks = await Promise.all(
      contacts.map(async contact => {
        const isVerified = await isNumberVerified(contact.phone);
        return { contact, isVerified };
      })
    );

    // Filter out unverified numbers
    const unverifiedNumbers = verificationChecks
      .filter(check => !check.isVerified)
      .map(check => formatPhoneNumber(check.contact.phone));

    if (unverifiedNumbers.length > 0) {
      throw new Error(
        `The following numbers are not verified: ${unverifiedNumbers.join(', ')}. ` +
        'Please verify these numbers in your Twilio console first. ' +
        'Visit: https://www.twilio.com/console/phone-numbers/verified'
      );
    }

    const message = 'EMERGENCY SOS ALERT: I need immediate assistance. Please check on me as soon as possible.';
    
    // Send both SMS and make calls to all verified contacts
    const promises = contacts.flatMap(contact => [
      sendSOSMessage(contact.phone, `SOS Alert from ${contact.name}: ${message}`),
      makeSOSCall(contact.phone)
    ]);

    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error('Error triggering SOS:', error);
    throw error;
  }
}; 