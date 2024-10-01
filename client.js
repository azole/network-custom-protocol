const net = require('node:net');
const PORT = 5567;
const HOST = '127.0.0.1';

const client = new net.Socket();
client.connect(PORT, HOST, () => {
  const dt = new Date();
  console.log(
    `Connected to the server ${HOST} on port ${PORT}, send 'Hello' at ${dt.toISOString()}`
  );
  client.write('Hello');
});

client.on('data', (data) => {
  const dt = new Date();
  if (data != 'Goodbye') {
    console.log(
      `Received: ${data} and then send FIN packet at  ${dt.toISOString()}`
    );
    client.end(); // Half-closes the socket. i.e., it sends a FIN packet.
  } else {
    console.log(
      `After disconnection, client still can receive data '${data}' from server at  ${dt.toISOString()}`
    );
  }
});

client.on('close', () => {
  const dt = new Date();
  console.log('Connection closed at ' + dt.toISOString());
});
