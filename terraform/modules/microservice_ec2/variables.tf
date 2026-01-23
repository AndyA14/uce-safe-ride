variable "private_subnet" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "microservice_sg" {
  type = string
}

variable "services" {
  type = list(object({
    name  = string
    image = string
    port  = number
  }))
}
