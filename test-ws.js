const WebSocket = require('ws');
const ws = new WebSocket('wss://stage-tracker.convex.cloud');

ws.on('open', function open() {
  console.log('Connected');
  ws.close();
});

ws.on('error', function error(err) {
  console.error('Error:', err.message);
});

ws.on('unexpected-response', function unexpectedResponse(req, res) {
  console.error('Unexpected response:', res.statusCode);
});
