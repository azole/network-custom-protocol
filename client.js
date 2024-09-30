const net = require('node:net');
const PORT = 5567;
const HOST = '127.0.0.1';

const client = new net.Socket();
client.connect(PORT, HOST, () => {
  console.log(`Connected to the server ${HOST} on port ${PORT}`);
  client.write('Hello');
});

client.on('data', (data) => {
  console.log(`Received: ${data} and then send FIN packet`);
  client.end(); // Half-closes the socket. i.e., it sends a FIN packet.
});

client.on('close', () => {
  console.log('Connection closed');
});
