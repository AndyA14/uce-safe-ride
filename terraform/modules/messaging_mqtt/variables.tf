variable "project" {}
variable "environment" {}

variable "vpc_id" {}
variable "subnet_id" {}
variable "security_group_id" {}

variable "instance_type" {
  default = "t3.micro"
}

variable "volume_size" {
  default = 10
}

variable "mqtt_port" {
  default = 1883
}
