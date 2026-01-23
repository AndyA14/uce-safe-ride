variable "project" {}
variable "environment" {}

variable "vpc_id" {}
variable "subnet_id" {}
variable "security_group_id" {}

variable "instance_type" {
  default = "t3.micro"
}

variable "frontend_port" {
  default = 80
}

variable "frontend_repo" {
  description = "Git repo with frontend build or static files"
}
