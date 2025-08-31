const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testAPI() {
  console.log('🔍 Testing API endpoints...\n');

  const tests = [
    { name: 'Health Check', url: '/api/test' },
    { name: 'Apps Endpoint', url: '/api/apps' },
    { name: 'Apps Installed', url: '/api/apps/installed' },
    { name: 'Threat Analysis', url: '/api/apps/threat-analysis', method: 'POST', data: { 
      packageName: 'com.whatsapp', 
      permissions: ['android.permission.READ_CONTACTS'], 
      isSystemApp: false 
    }}
  ];

  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      
      const config = {
        method: test.method || 'GET',
        url: `${BASE_URL}${test.url}`,
        timeout: 5000
      };
      
      if (test.data) {
        config.data = test.data;
      }
      
      const response = await axios(config);
      console.log(`✅ ${test.name}: ${response.status} - ${response.statusText}`);
      
      if (test.name === 'Threat Analysis') {
        console.log(`   AbuseIPDB configured: ${response.data.analyzedAt ? 'Yes' : 'No'}`);
      }
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`❌ ${test.name}: Server not running`);
      } else {
        console.log(`❌ ${test.name}: ${error.response?.status || error.code} - ${error.message}`);
      }
    }
  }
  
  console.log('\n🔍 Testing complete!');
}

// Run the test
testAPI().catch(console.error);