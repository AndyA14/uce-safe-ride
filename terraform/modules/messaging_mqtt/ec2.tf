resource "aws_instance" "mqtt" {
  ami                    = "ami-0c02fb55956c7d316"
  instance_type          = var.instance_type
  subnet_id              = var.subnet_id
  vpc_security_group_ids = [var.security_group_id]

  user_data = templatefile("${path.module}/user_data.sh", {
    mqtt_port = var.mqtt_port
  })

  tags = {
    Name        = "${var.project}-mqtt-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_ebs_volume" "mqtt_data" {
  availability_zone = aws_instance.mqtt.availability_zone
  size              = var.volume_size
  type              = "gp3"

  tags = {
    Name = "${var.project}-mqtt-ebs-${var.environment}"
  }
}

resource "aws_volume_attachment" "mqtt_attach" {
  device_name = "/dev/xvdf"
  volume_id   = aws_ebs_volume.mqtt_data.id
  instance_id = aws_instance.mqtt.id
}
