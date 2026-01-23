output "redis_instance_id" {
  value = aws_instance.redis.id
}

output "redis_private_ip" {
  value = aws_instance.redis.private_ip
}
