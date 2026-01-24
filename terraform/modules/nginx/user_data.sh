#!/bin/bash
set -e

yum update -y
amazon-linux-extras install nginx1 -y
systemctl enable nginx
systemctl start nginx

cat <<EOF > /etc/nginx/conf.d/reverse-proxy.conf
${reverse_proxy_conf}
EOF

systemctl restart nginx
