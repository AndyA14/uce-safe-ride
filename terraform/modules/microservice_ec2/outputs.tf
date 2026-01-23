output "microservices_private_ips" {
  value = {
    for name, instance in aws_instance.this :
    name => instance.private_ip
  }
}
