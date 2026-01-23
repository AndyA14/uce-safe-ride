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
mkdir -p /data/kafka
mount /dev/xvdf /data/kafka
echo "/dev/xvdf /data/kafka xfs defaults,nofail 0 2" >> /etc/fstab

mkdir -p /data/kafka/zookeeper
mkdir -p /data/kafka/kafka

# Zookeeper
docker run -d \
  --name zookeeper \
  --restart unless-stopped \
  -p 2181:2181 \
  -v /data/kafka/zookeeper:/data \
  zookeeper:3.8

# Kafka
docker run -d \
  --name kafka \
  --restart unless-stopped \
  -p 9092:9092 \
  -e KAFKA_BROKER_ID=1 \
  -e KAFKA_ZOOKEEPER_CONNECT=localhost:2181 \
  -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://$(curl -s http://169.254.169.254/latest/meta-data/local-ipv4):9092 \
  -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
  -v /data/kafka/kafka:/var/lib/kafka/data \
  bitnami/kafka:3.6
