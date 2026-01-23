#!/bin/bash
set -e

# Actualizar sistema
yum update -y

# Instalar Docker
amazon-linux-extras install docker -y
systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

# Crear filesystem para Mongo
mkfs -t xfs /dev/xvdf
mkdir -p /data/mongo
mount /dev/xvdf /data/mongo
echo "/dev/xvdf /data/mongo xfs defaults,nofail 0 2" >> /etc/fstab

# Crear carpetas
mkdir -p /data/mongo/db
mkdir -p /backups

# Ejecutar MongoDB
docker run -d \
  --name mongo \
  --restart unless-stopped \
  -p ${mongo_port}:27017 \
  -v /data/mongo/db:/data/db \
  mongo:6

# Backups cada 5 minutos
cat <<EOF > /etc/cron.d/mongo-backup
*/5 * * * * root docker exec mongo mongodump --out /backups/backup_\$(date +\%F_\%T)
EOF
