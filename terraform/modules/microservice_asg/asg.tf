resource "aws_autoscaling_group" "this" {
  desired_capacity    = 2
  max_size            = 4
  min_size            = 2
  vpc_zone_identifier = var.private_subnets
  launch_template {
    id      = aws_launch_template.this.id
    version = "$Latest"
  }
  target_group_arns = [var.target_group_arn]
}
