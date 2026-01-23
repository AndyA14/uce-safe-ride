resource "aws_instance" "frontend" {
  ami                    = "ami-0c02fb55956c7d316"
  instance_type          = var.instance_type
  subnet_id              = var.subnet_id
  vpc_security_group_ids = [var.security_group_id]

  user_data = templatefile("${path.module}/user_data.sh", {
    frontend_port = var.frontend_port
    frontend_repo = var.frontend_repo
  })

  tags = {
    Name        = "${var.project}-frontend-${var.environment}"
    Environment = var.environment
  }
}
