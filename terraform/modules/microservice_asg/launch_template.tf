resource "aws_launch_template" "this" {
  name_prefix   = "microservice-lt-"
  image_id      = "ami-0c02fb55956c7d316"
  instance_type = "t3.micro"
}
