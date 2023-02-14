#!/usr/bin/env node

//
const IS_DEV = process.env['NODE_ENV'] !== 'production';
const PORT = 8988;
const HOSTS = ['box.local'];
//

const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);
const jsonParser = require('body-parser').json();

// allow to serve static only for dev
if (IS_DEV) app.use(express.static('public'));

app.ws('/', function (ws, req) {
  const UID = Math.random().toString(36).slice(2, 12);
  ws.UID = UID;
  ws.send(JSON.stringify({ type: 'connected', id: UID }));
  // console.log('<<< WS CONNECTED', UID);
  // ws.on('message', function (msg) { console.log('<<< WS MESSAGE', msg) });
  // ws.on('close', function () { console.log('<<< WS CLOSE', UID) });
});
const wsq = expressWs.getWss('/');
const sentToAll = (message) => {
  if (typeof message !== 'string') message = JSON.stringify(message);
  wsq.clients.forEach(function (client) { client.send(message) });
}

app.post('/', jsonParser, function (req, res) {
  sentToAll(req.body);
  res.send({ ok: true });
});

setInterval(function () {
  sentToAll({ type: 'ping' });
}, 15000);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
});
