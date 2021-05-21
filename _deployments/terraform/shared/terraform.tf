provider "aws" {
  version    = "~> 2.12"
  access_key = "${var.access_key}"
  secret_key = "${var.secret_key}"
  region     = "${var.region}"
}

terraform {
  backend "remote" {
    organization = "verifi"

    workspaces {
      name = "enterprise-shared"
    }
  }
}

resource "aws_ecs_cluster" "enterpriseapi" {
  name = "enterprise-api"
}
