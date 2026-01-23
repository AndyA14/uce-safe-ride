resource "aws_instance" "this" {
  for_each = {
    for svc in var.services : svc.name => svc
  }

  ami           = "ami-0c02fb55956c7d316"
  instance_type = "t3.micro"
  subnet_id     = var.private_subnet

  vpc_security_group_ids = [var.microservice_sg]

  user_data = templatefile("${path.module}/user_data.sh", {
    service_name = each.value.name
    image        = each.value.image
    port         = each.value.port
  })

  tags = {
    Name = each.value.name
  }
}
