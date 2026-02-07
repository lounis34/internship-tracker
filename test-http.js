const https = require('https');
https.get('https://stage-tracker.convex.cloud', (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
}).on('error', (e) => {
  console.error('Error:', e);
});
