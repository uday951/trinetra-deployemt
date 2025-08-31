import axios from 'axios';

export const testBackendConnection = async () => {
  const urls = [
    'http://10.0.2.2:5000', // Android emulator
    'http://localhost:5000', // iOS simulator/web
    'http://192.168.1.100:5000', // Local network (replace with your IP)
  ];

  console.log('🔍 Testing backend connections...');

  for (const url of urls) {
    try {
      console.log(`Testing: ${url}`);
      const response = await axios.get(`${url}/health`, { timeout: 5000 });
      
      if (response.status === 200) {
        console.log(`✅ Connected to: ${url}`);
        return url;
      }
    } catch (error) {
      console.log(`❌ Failed to connect to: ${url}`);
    }
  }

  console.log('❌ No backend connection found');
  return null;
};

export const getLocalIPAddress = () => {
  // This would need to be implemented with a native module
  // For now, return common local IP patterns
  return [
    '192.168.1.100',
    '192.168.0.100', 
    '10.0.0.100'
  ];
};