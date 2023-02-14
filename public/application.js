const DROPOUT_TYPES = {};

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
  const socket = new WebSocket(`ws://${location.host}${location.pathname}`);
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
  $$message = function (data) {
    const line = document.createElement('p');
    line.setAttribute('type', data.type);
    line.innerHTML = `
      <span class="title">${(new Date()).toLocaleString()}</span>
      <pre style="margin:0;">${JSON.stringify(data, null, '  ')}</pre>
    `;
    if (DROPOUT_TYPES[data.type]) line.style.display = 'none';
    node.appendChild(line);
    $$onMessage.call(this, data);
  }
  connect();
}

window.$send = (message) => {
  return fetch(`//${location.host}${location.pathname}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  }).then(response => response.json());
}

// filters
function onFilterChange(evt) {
  const type = evt.target.name;
  const drop = evt.target.checked;
  DROPOUT_TYPES[type] = drop;
  Array.from(document.querySelectorAll(`p[type=${type}]`)).forEach((node) => {
    node.style.display = drop ? 'none' : '';
  });
}

Array.from(document.querySelectorAll('.filters input')).forEach((node) => {
  DROPOUT_TYPES[node.name] = node.checked;
  node.addEventListener('change', onFilterChange);
});
