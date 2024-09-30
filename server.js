const net = require('node:net');
const PORT = 5567;
const HOST = '0.0.0.0'; // ::1 for ipv6

const store = {};

const server = net
  .createServer({ allowHalfOpen: true }, (socket) => {
    console.log('Client connected');
    socket.write(`Welcome to the server, my IP is ${socket.localAddress}`);

    socket.on('data', (data) => {
      let body = data.toString();
      console.log(body);
      let response = '';
      switch (body[0]) {
        case '1': // split by delimiter ;
          response = dataProcessor1(body.substring(1, body.length - 1));
          break;
        case '2': // split by fix length
          response = dataProcessor2(body.substring(1, body.length - 1));
          break;
        case '3': // length-prefixed
          response = dataProcessor3(body.substring(1, body.length - 1));
          break;
        case '4': // json
          response = dataProcessor4(body.substring(1, body.length - 1));
          break;
        default:
          socket.write(
            JSON.stringify({
              remoteAddr: socket.remoteAddress,
              remotePort: socket.remotePort,
              localAddr: socket.localAddress,
              localPort: socket.localPort,
            })
          );
          break;
      }
      socket.write(response);
    });

    socket.on('error', (err) => {
      console.error(err);
    });

    socket.on('end', () => {
      // socket.write('Goodbye');
      console.log('Client disconnected');
      socket.end();
    });
  })
  .listen(PORT, HOST, () => {
    console.log('Server started on port', PORT);
  });

// Oerations for Store
let operations = {
  w: (key, value) => {
    store[key] = value;
    return JSON.stringify({ [key]: value });
  },
  r: (key) => {
    return JSON.stringify({ [key]: store[key] });
  },
  d: (key) => {
    delete store[key];
    return JSON.stringify({ [key]: 'deleted' });
  },
  l: () => {
    return JSON.stringify(store);
  },
};

// split by delimiter ;
function dataProcessor1(data) {
  // Process data
  console.log(`Before processing: ${data}`);
  const body = data.split(';');
  let command = body[0]; // w, r, d, l
  let key = body[1];
  let value = body[2];
  console.log(`command: ${command}, key: ${key}, value: ${value}`);
  return operations[command](key, value);
}

// split by fix length
function dataProcessor2(data) {
  console.log(`Before processing: ${data}`);
  let command = data.substring(0, 1);
  let key = data.substring(1, 6);
  let value = data.substring(6, 16);
  console.log(`command: ${command}, key: ${key}, value: ${value}`);
  return operations[command](key, value);
}

// length-prefixed
// length field is 2 bytes
function dataProcessor3(data) {
  console.log(`Before processing: ${data}`);
  let command = data.substring(0, 1);
  let keyLength = parseInt(data.substring(1, 3));
  let key = data.substring(3, 3 + keyLength);
  let valueLength = parseInt(data.substring(3 + keyLength, 5 + keyLength));
  let value = data.substring(5 + keyLength, 5 + keyLength + valueLength);
  console.log(`command: ${command}, key: ${key}, value: ${value}`);
  return operations[command](key, value);
}

// json
function dataProcessor4(data) {
  console.log(`Before processing: ${data}`);
  let body = JSON.parse(data);
  console.log(
    `command: ${body.command}, key: ${body.key}, value: ${body.value}`
  );
  return operations[body.command](body.key, body.value);
}
