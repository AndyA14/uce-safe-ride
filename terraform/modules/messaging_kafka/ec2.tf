resource "aws_instance" "kafka" {
  ami                    = "ami-0c02fb55956c7d316"
  instance_type          = var.instance_type
  subnet_id              = var.subnet_id
  vpc_security_group_ids = [var.security_group_id]

  user_data = templatefile("${path.module}/user_data.sh", {
    kafka_port     = var.kafka_port
    zookeeper_port = var.zookeeper_port
  })

  tags = {
    Name        = "${var.project}-kafka-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_ebs_volume" "kafka_data" {
  availability_zone = aws_instance.kafka.availability_zone
  size              = var.volume_size
  type              = "gp3"

  tags = {
    Name = "${var.project}-kafka-ebs-${var.environment}"
  }
}

resource "aws_volume_attachment" "kafka_attach" {
  device_name = "/dev/xvdf"
  volume_id   = aws_ebs_volume.kafka_data.id
  instance_id = aws_instance.kafka.id
}
