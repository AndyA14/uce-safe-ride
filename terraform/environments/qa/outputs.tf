output "environment" {
  value = var.environment
}

output "vpc_id" {
  value = module.networking.vpc_id
}
