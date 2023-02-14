#!/usr/bin/env node

const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);
const jsonParser = require('body-parser').json();
const port = 8988;

app.use(express.static('public'));

app.ws('/ws', function (ws, req) {
  const UID = Math.random().toString(36).slice(2, 12);
  ws.UID = UID;
  ws.send(JSON.stringify({ type: 'connected', id: UID }));
  // console.log('<<< WS CONNECTED', UID);
  // ws.on('message', function (msg) { console.log('<<< WS MESSAGE', msg) });
  // ws.on('close', function () { console.log('<<< WS CLOSE', UID) });
});
const wsq = expressWs.getWss('/ws');
const sentToAll = (message) => {
  if (typeof message !== 'string') message = JSON.stringify(message);
  wsq.clients.forEach(function (client) { client.send(message) });
}

app.post('/notify', jsonParser, function (req, res) {
  sentToAll(req.body);
  res.send({ ok: true });
});

setInterval(function () {
  sentToAll({ ping: true });
}, 15000);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
