#!/bin/bash
set -e

yum update -y
amazon-linux-extras install docker -y

systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

docker pull ${image}

docker run -d \
  --restart always \
  -p ${port}:${port} \
  --name ${service_name} \
  ${image}
