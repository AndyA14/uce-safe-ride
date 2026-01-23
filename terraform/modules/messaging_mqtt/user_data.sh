#!/bin/bash
set -e

yum update -y

# Docker
amazon-linux-extras install docker -y
systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

# Disco persistente
mkfs -t xfs /dev/xvdf
mkdir -p /data/mqtt
mount /dev/xvdf /data/mqtt
echo "/dev/xvdf /data/mqtt xfs defaults,nofail 0 2" >> /etc/fstab

mkdir -p /data/mqtt/config
mkdir -p /data/mqtt/data
mkdir -p /data/mqtt/log

# Config Mosquitto
cat <<EOF > /data/mqtt/config/mosquitto.conf
persistence true
persistence_location /mosquitto/data/
log_dest file /mosquitto/log/mosquitto.log
listener ${mqtt_port}
allow_anonymous true
EOF

# Mosquitto
docker run -d \
  --name mosquitto \
  --restart unless-stopped \
  -p ${mqtt_port}:${mqtt_port} \
  -v /data/mqtt/config:/mosquitto/config \
  -v /data/mqtt/data:/mosquitto/data \
  -v /data/mqtt/log:/mosquitto/log \
  eclipse-mosquitto:2
