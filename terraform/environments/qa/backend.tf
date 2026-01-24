terraform {
  backend "s3" {
    bucket         = "uce-safe-ride-tfstate-qa"
    key            = "qa/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
  }
}
