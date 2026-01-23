resource "aws_instance" "postgres" {
  ami                    = "ami-0c02fb55956c7d316"
  instance_type          = var.instance_type
  subnet_id              = var.subnet_id
  vpc_security_group_ids = [var.security_group_id]

  user_data = templatefile("${path.module}/user_data.sh", {
    postgres_port     = var.postgres_port
    postgres_user     = var.postgres_user
    postgres_password = var.postgres_password
  })

  tags = {
    Name        = "${var.project}-postgres-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_ebs_volume" "postgres_data" {
  availability_zone = aws_instance.postgres.availability_zone
  size              = var.volume_size
  type              = "gp3"

  tags = {
    Name = "${var.project}-postgres-ebs-${var.environment}"
  }
}

resource "aws_volume_attachment" "postgres_attach" {
  device_name = "/dev/xvdf"
  volume_id   = aws_ebs_volume.postgres_data.id
  instance_id = aws_instance.postgres.id
}
