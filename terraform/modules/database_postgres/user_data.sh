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
mkdir -p /data/postgres
mount /dev/xvdf /data/postgres
echo "/dev/xvdf /data/postgres xfs defaults,nofail 0 2" >> /etc/fstab

mkdir -p /data/postgres/db

# PostgreSQL container
docker run -d \
  --name postgres \
  --restart unless-stopped \
  -p ${postgres_port}:5432 \
  -e POSTGRES_USER=${postgres_user} \
  -e POSTGRES_PASSWORD=${postgres_password} \
  -v /data/postgres/db:/var/lib/postgresql/data \
  postgres:15
