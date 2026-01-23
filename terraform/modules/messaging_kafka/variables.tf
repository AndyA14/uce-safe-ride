variable "project" {}
variable "environment" {}

variable "vpc_id" {}
variable "subnet_id" {}
variable "security_group_id" {}

variable "instance_type" {
  default = "t3.micro"
}

variable "volume_size" {
  default = 20
}

variable "kafka_port" {
  default = 9092
}

variable "zookeeper_port" {
  default = 2181
}
