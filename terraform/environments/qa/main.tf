provider "aws" {
  region = var.region
}

module "networking" {
  source      = "../../modules/networking"
  project     = var.project
  environment = var.environment
}

module "security" {
  source      = "../../modules/security"
  vpc_id      = module.networking.vpc_id
  vpc_cidr    = module.networking.vpc_cidr
  environment = var.environment
}


module "bastion" {
  source         = "../../modules/bastion"
  public_subnet  = module.networking.public_subnets[0]
  vpc_id         = module.networking.vpc_id
  security_group = module.security.bastion_sg
}

module "kafka" {
  source            = "../../modules/messaging_kafka"
  project           = var.project
  environment       = var.environment
  vpc_id            = module.networking.vpc_id
  subnet_id         = module.networking.private_subnets[5]
  security_group_id = module.security.kafka_sg
}

module "postgres" {
  source            = "../../modules/database_postgres"
  project           = var.project
  environment       = var.environment
  vpc_id            = module.networking.vpc_id
  subnet_id         = module.networking.private_subnets[2]
  security_group_id = module.security.postgres_sg

  postgres_password = var.postgres_password
}


module "mongo" {
  source            = "../../modules/database_mongo"
  project           = var.project
  environment       = var.environment
  vpc_id            = module.networking.vpc_id
  subnet_id         = module.networking.private_subnets[1]
  security_group_id = module.security.mongo_sg
}

module "redis" {
  source            = "../../modules/database_redis"
  project           = var.project
  environment       = var.environment
  vpc_id            = module.networking.vpc_id
  subnet_id         = module.networking.private_subnets[3]
  security_group_id = module.security.redis_sg
}

module "rabbitmq" {
  source            = "../../modules/messaging_rabbitmq"
  project           = var.project
  environment       = var.environment
  vpc_id            = module.networking.vpc_id
  subnet_id         = module.networking.private_subnets[4]
  security_group_id = module.security.rabbitmq_sg
}

module "mqtt" {
  source            = "../../modules/messaging_mqtt"
  project           = var.project
  environment       = var.environment
  vpc_id            = module.networking.vpc_id
  subnet_id         = module.networking.private_subnets[6]
  security_group_id = module.security.mqtt_sg
}


module "nginx" {
  source        = "../../modules/nginx"
  public_subnet = module.networking.public_subnets[1]
  vpc_id        = module.networking.vpc_id
}
module "frontend" {
  source            = "../../modules/frontend"
  project           = var.project
  environment       = var.environment
  vpc_id            = module.networking.vpc_id
  subnet_id         = module.networking.private_subnets[7]
  security_group_id = module.security.frontend_sg

  frontend_repo = "https://github.com/tu-org/frontend-build.git"
}


module "microservices" {
  source             = "../../modules/microservice_ec2"
  private_subnet     = module.networking.private_subnets[0]
  vpc_id             = module.networking.vpc_id
  microservice_sg    = module.security.microservice_sg

  services = [
    {
      name  = "auth-service"
      image = "aceofglass14/uce-auth-service:qa"
      port  = 8001
    },
    {
      name  = "student-service"
      image = "aceofglass14/uce-student-service:qa"
      port  = 8002
    },
    {
      name  = "driver-service"
      image = "aceofglass14/uce-driver-service:qa"
      port  = 8005
    },
    {
      name  = "route-service"
      image = "aceofglass14/uce-route-service:qa"
      port  = 8003
    },
    {
      name  = "trip-service"
      image = "aceofglass14/uce-trip-service:qa"
      port  = 8010
    },
    {
      name  = "vehicle-service"
      image = "aceofglass14/uce-vehicle-service:qa"
      port  = 8004
    },
    {
      name  = "simulation-service"
      image = "aceofglass14/uce-simulation-service:qa"
      port  = 8011
    },
    {
      name  = "notification-service"
      image = "aceofglass14/uce-notification-service:qa"
      port  = 8008
    },
    {
      name  = "stop-service"
      image = "aceofglass14/uce-stop-service:qa"
      port  = 8007
    },
    {
      name  = "tracking-service"
      image = "aceofglass14/uce-tracking-service:qa"
      port  = 8006
    },
    {
      name  = "ws-gateway"
      image = "aceofglass14/uce-ws-gateway:qa"
      port  = 8009
    }
  ]
}
