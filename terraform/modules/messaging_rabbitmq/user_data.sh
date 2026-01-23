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
mkdir -p /data/rabbitmq
mount /dev/xvdf /data/rabbitmq
echo "/dev/xvdf /data/rabbitmq xfs defaults,nofail 0 2" >> /etc/fstab

mkdir -p /data/rabbitmq/data

# RabbitMQ con Management UI
docker run -d \
  --name rabbitmq \
  --restart unless-stopped \
  -p ${rabbitmq_port}:5672 \
  -p ${rabbitmq_management_port}:15672 \
  -v /data/rabbitmq/data:/var/lib/rabbitmq \
  rabbitmq:3-management
