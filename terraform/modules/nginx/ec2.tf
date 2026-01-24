resource "aws_instance" "nginx" {
  ami                    = "ami-0c02fb55956c7d316"
  instance_type          = "t3.micro"
  subnet_id              = var.public_subnet
  vpc_security_group_ids = [var.security_group]

  user_data = templatefile("${path.module}/user_data.sh", {
    reverse_proxy_conf = templatefile(
      "${path.module}/templates/reverse-proxy.conf.tpl",
      {
        frontend_ip = var.frontend_ip
        auth_ip     = var.auth_ip
        student_ip  = var.student_ip
        driver_ip   = var.driver_ip
        ws_ip       = var.ws_ip
      }
    )
  })

  tags = {
    Name = "nginx-${var.environment}"
  }
}
