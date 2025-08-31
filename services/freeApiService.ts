// Free APIs for testing anti-theft features
export class FreeApiService {
  
  // OpenStreetMap Nominatim - Free geocoding (no API key needed)
  static async reverseGeocode(lat: number, lng: number) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      return {
        address: data.display_name,
        city: data.address?.city || data.address?.town || data.address?.village,
        country: data.address?.country,
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  // IPGeolocation - Free IP location (1000 requests/day, no API key for basic)
  static async getLocationByIP() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city,
        country: data.country_name,
        ip: data.ip,
      };
    } catch (error) {
      console.error('IP location error:', error);
      return null;
    }
  }

  // EmailJS - Free email service (300 emails/month)
  static async sendEmergencyEmail(location: any, deviceInfo: any) {
    try {
      // You'll need to sign up at emailjs.com and get these IDs
      const serviceId = 'service_test123'; // Replace with your EmailJS service ID
      const templateId = 'template_test123'; // Replace with your EmailJS template ID
      const publicKey = 'your_public_key'; // Replace with your EmailJS public key

      const templateParams = {
        device_name: deviceInfo.deviceName || 'Unknown Device',
        location: `${location.latitude}, ${location.longitude}`,
        address: location.address || 'Address not available',
        timestamp: new Date().toLocaleString(),
        alert_type: 'Device Theft Alert',
      };

      // This is a mock implementation - you'd use EmailJS SDK in real app
      console.log('Emergency email would be sent:', templateParams);
      return { success: true, message: 'Emergency email sent' };
    } catch (error) {
      console.error('Email sending error:', error);
      return { success: false, error: error.message };
    }
  }

  // Free SMS via email-to-SMS gateways (carrier dependent)
  static async sendEmergencySMS(phoneNumber: string, message: string) {
    try {
      // Common email-to-SMS gateways (free but limited)
      const carriers = {
        verizon: '@vtext.com',
        att: '@txt.att.net',
        tmobile: '@tmomail.net',
        sprint: '@messaging.sprintpcs.com',
      };

      // This would require EmailJS or similar service
      console.log(`SMS would be sent to ${phoneNumber}: ${message}`);
      return { success: true, message: 'SMS sent via email gateway' };
    } catch (error) {
      console.error('SMS sending error:', error);
      return { success: false, error: error.message };
    }
  }

  // Webhook.site - Free webhook testing
  static async sendWebhookAlert(data: any) {
    try {
      // Get a free webhook URL from webhook.site
      const webhookUrl = 'https://webhook.site/your-unique-id'; // Replace with your webhook.site URL
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alert_type: 'anti_theft',
          timestamp: new Date().toISOString(),
          data,
        }),
      });

      return { success: response.ok, status: response.status };
    } catch (error) {
      console.error('Webhook error:', error);
      return { success: false, error: error.message };
    }
  }

  // Free geofencing check using simple distance calculation
  static isInsideGeofence(
    currentLat: number, 
    currentLng: number, 
    centerLat: number, 
    centerLng: number, 
    radiusMeters: number
  ) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = currentLat * Math.PI/180;
    const φ2 = centerLat * Math.PI/180;
    const Δφ = (centerLat-currentLat) * Math.PI/180;
    const Δλ = (centerLng-currentLng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const distance = R * c;
    return distance <= radiusMeters;
  }
}