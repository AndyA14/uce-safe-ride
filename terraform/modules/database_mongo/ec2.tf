resource "aws_instance" "mongo" {
  ami                    = "ami-0c02fb55956c7d316" # Amazon Linux 2
  instance_type          = var.instance_type
  subnet_id              = var.subnet_id
  vpc_security_group_ids = [var.security_group_id]

  user_data = templatefile("${path.module}/user_data.sh", {
    mongo_port = var.mongo_port
  })

  tags = {
    Name        = "${var.project}-mongo-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_ebs_volume" "mongo_data" {
  availability_zone = aws_instance.mongo.availability_zone
  size              = var.volume_size
  type              = "gp3"

  tags = {
    Name = "${var.project}-mongo-ebs-${var.environment}"
  }
}

resource "aws_volume_attachment" "mongo_attach" {
  device_name = "/dev/xvdf"
  volume_id   = aws_ebs_volume.mongo_data.id
  instance_id = aws_instance.mongo.id
}
