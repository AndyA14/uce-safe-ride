output "rabbitmq_instance_id" {
  value = aws_instance.rabbitmq.id
}

output "rabbitmq_private_ip" {
  value = aws_instance.rabbitmq.private_ip
}
