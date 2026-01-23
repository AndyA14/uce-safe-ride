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
mkdir -p /data/redis
mount /dev/xvdf /data/redis
echo "/dev/xvdf /data/redis xfs defaults,nofail 0 2" >> /etc/fstab

mkdir -p /data/redis/data

# Redis con AOF (persistencia)
docker run -d \
  --name redis \
  --restart unless-stopped \
  -p ${redis_port}:6379 \
  -v /data/redis/data:/data \
  redis:7 \
  redis-server --appendonly yes
