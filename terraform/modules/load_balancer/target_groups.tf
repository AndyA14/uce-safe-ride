resource "aws_lb_target_group" "this" {
  name     = "uce-safe-ride-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id  = var.vpc_id
}
