output "mqtt_instance_id" {
  value = aws_instance.mqtt.id
}

output "mqtt_private_ip" {
  value = aws_instance.mqtt.private_ip
}
