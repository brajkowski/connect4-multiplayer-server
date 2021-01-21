import WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
  ws.send('hello from client');
});

ws.on('message', (data) => {
  console.log(data);
});
