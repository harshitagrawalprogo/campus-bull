const http = require('http'); // fallback if fetch is not available, but we'll use fetch
// If you are using Node 18+, fetch is built-in.

const API_URL = 'http://localhost:5000/api/qa'; // Change this to the route you want to test
const JWT_TOKEN = ''; // Put your user or admin JWT token here if the route is protected

async function testRoute() {
  console.log(`\n--- Testing Route: ${API_URL} ---`);
  
  try {
    const response = await fetch(API_URL, {
      method: 'GET', // Change to POST, PATCH, etc., if needed
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${JWT_TOKEN}` // Uncomment if the route requires a token
      },
      // body: JSON.stringify({ key: 'value' }) // Uncomment for POST/PATCH
    });

    console.log(`Status Code: ${response.status} ${response.statusText}`);
    console.log(`Headers:`, Object.fromEntries(response.headers.entries()));

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    console.log('\n--- Response Data ---');
    console.dir(data, { depth: null, colors: true });

  } catch (error) {
    console.error('\n❌ Request Failed. The server might be down or unreachable.');
    console.error('Error Details:', error.message);
    if (error.cause) console.error('Cause:', error.cause);
  }
}

testRoute();
