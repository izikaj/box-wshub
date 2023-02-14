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

## development sandbox
open [sandbox page](http://localhost:8988) & play

## Create background system service

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

ExecStart=/usr/bin/npm start
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

## add proxy to nginx config
```
  location /system/cable/ {
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $http_host;
    proxy_redirect off;

    proxy_pass http://127.0.0.1:8988/;

    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
```
