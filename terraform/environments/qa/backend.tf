terraform {
  backend "s3" {
    bucket         = "uce-safe-ride-terraform-state-qa"
    key            = "qa/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "uce-safe-ride-terraform-locks"
    encrypt        = true
  }
}
