resource "aws_instance" "this" {
  ami                    = "ami-0c02fb55956c7d316"
  instance_type          = "t3.micro"
  subnet_id              = var.public_subnet
  vpc_security_group_ids = [var.security_group]
}
