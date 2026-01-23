output "vpc_id" { value = module.networking.vpc_id }
output "bastion_ip" { value = module.bastion.bastion_ip }
output "nginx_ip" { value = module.nginx.nginx_ip }
output "microservices" { value = module.microservices.instances }
