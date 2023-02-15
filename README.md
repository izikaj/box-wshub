Simple websocket proxy server

# Install dependencies
```sh
npm install
```

# Start server
```sh
npm start
```

# Usage

## send json message to `/` endpoint via POST

```
  curl -X POST http://localhost:8988/
       -H 'Content-Type: application/json'
       -d '{"type":"some","message":"todo"}'
```

## connect to `/` endpoint as websocket connection to listen updates

```javascript
const sock = new WebSocket('ws://localhost:8988/');
sock.onmessage = (evt) => { console.log('MESSAGE:', JSON.parse(evt.data)); }
```
Or with some server-side filters set with qurty params
Param `only` - send only requested message types (one or array of values)
Param `except` - do not send mentioned types (one or array of values)
```javascript
const sock = new WebSocket('ws://localhost:8988/?only=ping&only=connected');
sock.onmessage = (evt) => { console.log('MESSAGE:', JSON.parse(evt.data)); }
```

## development sandbox
open [sandbox page](http://localhost:8988) & play

## Run as a service

[use pm2 package](https://www.npmjs.com/package/pm2) as a nodejs app supervisor

```sh
pm2 start src/app.js --name wshub
```
