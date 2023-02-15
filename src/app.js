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
console.log('IS_DEV', IS_DEV);
if (IS_DEV) {
  app.use(express.static('public'));
}

const CHANS = {};
const arrayWrap = (value) => Array.isArray(value) ? value : (value == undefined ? undefined : [value]);
const isAllowed = (type, only, except) => {
  if (except && except.includes(type)) return false;
  if (only && !only.includes(type)) return false;

  return true;
}

const filteredChans = (type) => Object.values(CHANS).filter(
  ({ only, except }) => isAllowed(type, only, except)
);

app.ws('/', function (ws, req) {
  const uid = Math.random().toString(36).slice(2, 12);
  ws.uid = uid;
  const only = arrayWrap(req.query.only);
  const except = arrayWrap(req.query.except);
  CHANS[uid] = { uid, ws, only, except };
  const type = 'connected';
  if (isAllowed(type, only, except)) ws.send(JSON.stringify({ type, uid }));
  // ws.on('message', function (msg) { console.log('<<< WS MESSAGE', msg) });
  ws.on('close', function () { delete CHANS[uid] });
});

const sentToAll = (message) => {
  const packet = JSON.stringify(message);

  console.log('sentToAll', message.type, filteredChans(message.type).length, filteredChans(message.type).map(i => i.uid));
  filteredChans(message.type).forEach(({ ws }) => ws.send(packet));
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
