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

## send json message to `/notify` endpoint via POST

```
  curl -X POST http://localhost:8080/notify
       -H 'Content-Type: application/json'
       -d '{"type":"some","message":"todo"}'
```

## connect to `/ws` endpoint as websocket connection to listen updates

```javascript
const sock = new WebSocket('ws://localhost:8080/ws');
sock.onmessage = (evt) => { console.log('MESSAGE:', JSON.parse(evt.data)); }
```

# Create background system service

Create `wshub` service
```sh
touch /etc/systemd/system/wshub.service
```

fulfill `wshub.service` with proper config
```
[Unit]
Description=WebSocket Proxy Server
After=network.target

[Service]
Type=simple
User=kenny
WorkingDirectory=/www/wshub
Environment=NODE_ENV=production

ExecStart=/usr/local/bin/npm start
Restart=always
KillMode=process

[Install]
WantedBy=multi-user.target
```

Register&start service:
```sh
sudo systemctl daemon-reload
sudo systemctl service wshub.service enable
sudo service wshub start
```

View service status:
```sh
sudo service wshub status
```

View service logs:
```sh
sudo journalctl -u wshub -e -f
```

Update service
```sh
sudo vi /etc/systemd/system/wshub.service
sudo service wshub restart
# in some cases you need to reload daemon
sudo systemctl daemon-reload
sudo systemctl service wshub.service enable
```
