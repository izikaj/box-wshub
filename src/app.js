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
const isAllowed = (type, only, except) => !((except && except.includes(type)) || (only && !only.includes(type)));
const isForApp = (self, app) => self === app;

const filteredChans = (type, app) => Object.values(CHANS).filter(
  ({ only, except, app: self }) => isForApp(self, app) && isAllowed(type, only, except)
);

const onWsConnected = (ws, req, app = undefined) => {
  const uid = Math.random().toString(36).slice(2, 12);
  console.warn('CONNECTED: ', app || 'ALL', uid);
  const only = arrayWrap(req.query.only);
  const except = arrayWrap(req.query.except);
  const type = 'connected';

  ws.uid = uid;
  CHANS[uid] = { uid, ws, only, except, app };
  if (isAllowed(type, only, except)) ws.send(JSON.stringify({ type, uid }));

  ws.on('close', () => {
    delete CHANS[uid];
    console.warn('DISCONNECTED: ', app || 'ALL', uid);
  });
}

app.ws('/:app', (ws, req) =>  onWsConnected(ws, req, req.params.app));
app.ws('/', (ws, req) => onWsConnected(ws, req));

const sentToAll = (message, app = undefined) => {
  message.app || (message.app = app);
  const packet = JSON.stringify(message);
  filteredChans(message.type, app).forEach(({ ws }) => ws.send(packet));
}

app.post('/', jsonParser, function (req, res) {
  sentToAll(req.body);
  res.send({ ok: true });
});

app.post('/:app', jsonParser, function (req, res) {
  sentToAll(req.body, req.params.app);
  res.send({ ok: true });
});

setInterval(() => sentToAll({ type: 'ping' }), PING_INTERVAL);

app.listen(PORT, () => console.log(`WShub app listening on port ${PORT}`));
