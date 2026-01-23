terraform {
  backend "s3" {
    bucket         = "uce-safe-ride-tfstate-prod"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "uce-safe-ride-tf-locks"
    encrypt        = true
  }
}
