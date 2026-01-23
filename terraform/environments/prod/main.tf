provider "aws" { region = var.region }

module "networking" {
  source      = "../../modules/networking"
  project     = var.project
  environment = var.environment
}

module "security" {
  source = "../../modules/security"
  vpc_id = module.networking.vpc_id
}

module "load_balancer" {
  source         = "../../modules/load_balancer"
  vpc_id         = module.networking.vpc_id
  public_subnets = module.networking.public_subnets
}

module "microservices" {
  source           = "../../modules/microservice_asg"
  vpc_id           = module.networking.vpc_id
  private_subnets  = module.networking.private_subnets
  target_group_arn = module.load_balancer.target_group_arn
}
