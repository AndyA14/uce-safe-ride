resource "aws_instance" "redis" {
  ami                    = "ami-0c02fb55956c7d316"
  instance_type          = var.instance_type
  subnet_id              = var.subnet_id
  vpc_security_group_ids = [var.security_group_id]

  user_data = templatefile("${path.module}/user_data.sh", {
    redis_port = var.redis_port
  })

  tags = {
    Name        = "${var.project}-redis-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_ebs_volume" "redis_data" {
  availability_zone = aws_instance.redis.availability_zone
  size              = var.volume_size
  type              = "gp3"

  tags = {
    Name = "${var.project}-redis-ebs-${var.environment}"
  }
}

resource "aws_volume_attachment" "redis_attach" {
  device_name = "/dev/xvdf"
  volume_id   = aws_ebs_volume.redis_data.id
  instance_id = aws_instance.redis.id
}
