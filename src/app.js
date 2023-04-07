#!/usr/bin/env node

//
const IS_DEV = process.env['NODE_ENV'] !== 'production';
const PORT = 8988;
const PING_INTERVAL = 30000;
//

const express = require('express');
const jsonParser = require('body-parser').json();

const app = express();
require('express-ws')(app);

// allow to serve static only for dev
if (IS_DEV) {
  console.log('Development mode: enabling static server...');
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
  const only = arrayWrap(req.query.only);
  const except = arrayWrap(req.query.except);
  const type = 'connected';

  ws.uid = uid;
  CHANS[uid] = { uid, ws, only, except };
  if (isAllowed(type, only, except)) ws.send(JSON.stringify({ type, uid }));

  ws.on('close', function () { delete CHANS[uid] });
});

const sentToAll = (message) => {
  const packet = JSON.stringify(message);
  filteredChans(message.type).forEach(({ ws }) => ws.send(packet));
}

app.post('/', jsonParser, function (req, res) {
  sentToAll(req.body);
  res.send({ ok: true });
});

setInterval(() => sentToAll({ type: 'ping' }), PING_INTERVAL);

app.listen(PORT, () => console.log(`WShub app listening on port ${PORT}`));
