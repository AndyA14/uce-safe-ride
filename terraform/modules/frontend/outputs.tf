
output "frontend_instance_id" {
  value = aws_instance.frontend.id
}

output "frontend_private_ip" {
  value = aws_instance.frontend.private_ip
}
