output "bastion_sg" { value = aws_security_group.bastion.id }
output "microservice_sg" { value = aws_security_group.microservice.id }
output "mongo_sg" {
  value = aws_security_group.mongo_sg.id
}
output "kafka_sg" {
  value = aws_security_group.kafka_sg.id
}

output "postgres_sg" {
  value = aws_security_group.postgres_sg.id
}

output "redis_sg" {
  value = aws_security_group.redis_sg.id
}

output "rabbitmq_sg" {
  value = aws_security_group.rabbitmq_sg.id
}

output "mqtt_sg" {
  value = aws_security_group.mqtt_sg.id
}
