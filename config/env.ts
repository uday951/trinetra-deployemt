// Configuration using environment variables
export const TWILIO_CONFIG = {
  accountSid: process.env.EXPO_PUBLIC_TWILIO_ACCOUNT_SID || '',
  authToken: process.env.EXPO_PUBLIC_TWILIO_AUTH_TOKEN || '',
  phoneNumber: process.env.EXPO_PUBLIC_TWILIO_PHONE_NUMBER || '',
};

export const SECURITY_CONFIG = {
  virusTotal: {
    apiKey: process.env.EXPO_PUBLIC_VIRUSTOTAL_API_KEY || '',
    baseUrl: 'https://www.virustotal.com/vtapi/v2',
    rateLimit: 4
  },
  googleSafeBrowsing: {
    apiKey: process.env.EXPO_PUBLIC_GOOGLE_SAFE_BROWSING_API_KEY || '',
    baseUrl: 'https://safebrowsing.googleapis.com/v4',
    rateLimit: 10000
  },
  numVerify: {
    apiKey: process.env.EXPO_PUBLIC_NUMVERIFY_API_KEY || '',
    baseUrl: 'https://apilayer.net/api',
    rateLimit: 1000
  }
};

export const API_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.1.5:5000'
}; 
