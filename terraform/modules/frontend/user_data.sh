#!/bin/bash
set -e

yum update -y

# Nginx liviano solo para servir estáticos
amazon-linux-extras install nginx1 -y
systemctl start nginx
systemctl enable nginx

# Git
yum install git -y

# Directorio frontend
rm -rf /usr/share/nginx/html/*
cd /usr/share/nginx/html

# Clonar frontend
git clone ${frontend_repo} app
cp -r app/* .

# Config nginx
cat <<EOF > /etc/nginx/conf.d/frontend.conf
server {
    listen ${frontend_port};
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

systemctl restart nginx
