resource "aws_lb" "this" {
  name               = "uce-safe-ride-alb"
  load_balancer_type = "application"
  subnets            = var.public_subnets
}
