const $$appsConn = window.$$appsConn = {};
const DROPOUT_TYPES = {};
const node = document.getElementById('list');

const $$open = (app) => (_evt) => console.log(`[${app ? app : 'ALL'}][open] Connection established`);
const $$close = (app) => (_evt) => console.log(`[${app ? app : 'ALL'}][open] Connection closed`);
const $$error = (app) => (error) => console.log(`[${app ? app : 'ALL'}][open] error occured`, error);
let $$message = (app) => (data) => {
  console.log(`[${app ? app : 'ALL'}][message] Data received from server:`, data);

  if (node) {
    const line = document.createElement('p');
    line.setAttribute('type', data.type);
    line.innerHTML = `
      <span class="title">
        ${(new Date()).toLocaleString()}
        ${app ? `<b>[APP: ${app}]</b>` : ''}
      </span>
      <pre style="margin:0;">${JSON.stringify(data, null, '  ')}</pre>
    `;
    if (DROPOUT_TYPES[data.type]) line.style.display = 'none';
    node.appendChild(line);
    // $$onMessage.call(this, data);
  }
}

function connect(app = undefined) {
  if ($$appsConn[app]) return $$appsConn[app];

  const API = `ws://${location.host}${location.pathname}${app || ''}?except=stat`;
  const socket = new WebSocket(API);
  socket.onopen = $$open(app);
  socket.onmessage = (event) => {
    try {
      $$message(app)(JSON.parse(event.data));
    } catch (error) {
      $$error(app)(error);
    }
  }
  socket.onerror = $$error(app);
  socket.onclose = (event) => {
    if (!event.wasClean) return setTimeout(() => connect(app), 10000);

    return $$close(app)(event);
  }

  return $$appsConn[app] = socket;
}

if (node) {
  connect();
  connect('alt');
}

window.$$appsConn = $$appsConn;
window.$send = (message, app = undefined) => {
  return fetch(`//${location.host}${location.pathname}${app || ''}`, {
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
