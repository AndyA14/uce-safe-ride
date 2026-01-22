variable "environment" {
  type        = string
  description = "Environment name (qa | prod)"
}

variable "region" {
  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type    = string
  default = "uce-safe-ride"
}
