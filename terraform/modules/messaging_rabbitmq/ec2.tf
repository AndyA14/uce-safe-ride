resource "aws_instance" "rabbitmq" {
  ami                    = "ami-0c02fb55956c7d316"
  instance_type          = var.instance_type
  subnet_id              = var.subnet_id
  vpc_security_group_ids = [var.security_group_id]

  user_data = templatefile("${path.module}/user_data.sh", {
    rabbitmq_port            = var.rabbitmq_port
    rabbitmq_management_port = var.rabbitmq_management_port
  })

  tags = {
    Name        = "${var.project}-rabbitmq-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_ebs_volume" "rabbitmq_data" {
  availability_zone = aws_instance.rabbitmq.availability_zone
  size              = var.volume_size
  type              = "gp3"

  tags = {
    Name = "${var.project}-rabbitmq-ebs-${var.environment}"
  }
}

resource "aws_volume_attachment" "rabbitmq_attach" {
  device_name = "/dev/xvdf"
  volume_id   = aws_ebs_volume.rabbitmq_data.id
  instance_id = aws_instance.rabbitmq.id
}
