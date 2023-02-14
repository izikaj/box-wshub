function $$open(_event) {
  console.log('[open] Connection established');
}

function $$message(data) {
  console.log('[message] Data received from server:', data);
}

function $$close(_event) {
  console.log('[close] Connection closed');
}

function $$error(error) {
  console.log('error occured', error);
}

function connect() {
  const socket = new WebSocket('ws://localhost:8080/ws');
  socket.onopen = $$open;
  socket.onmessage = (event) => {
    try {
      $$message(JSON.parse(event.data));
    } catch (error) {
      $$error(error);
    }
  }
  socket.onerror = $$error;
  socket.onclose = (event) => {
    if (!event.wasClean) return setTimeout(connect, 10000);

    return $$close(event);
  }
  return socket
}

const node = document.getElementById('list');
if (node) {
  const $$onMessage = $$message;
  $$message = function(data) {
    const line = document.createElement('p');
    line.innerHTML = `
      <span class="title">${(new Date()).toLocaleString()}</span>
      <pre style="margin:0;">${JSON.stringify(data, null, '  ')}</pre>
    `;
    node.appendChild(line);
    $$onMessage.call(this, data);
  }
  connect();
}
