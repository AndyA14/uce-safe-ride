server {
    listen 80;

    # ========================
    # Frontend Web
    # ========================
    location / {
        proxy_pass http://${frontend_ip};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # ========================
    # Auth Service
    # ========================
    location /api/auth/ {
        proxy_pass http://${auth_ip}:8001;
    }

    # ========================
    # Student Service
    # ========================
    location /api/students/ {
        proxy_pass http://${student_ip}:8002;
    }

    # ========================
    # Driver Service
    # ========================
    location /api/drivers/ {
        proxy_pass http://${driver_ip}:8005;
    }

    # ========================
    # WS Gateway
    # ========================
    location /ws/ {
        proxy_pass http://${ws_ip}:8009;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
