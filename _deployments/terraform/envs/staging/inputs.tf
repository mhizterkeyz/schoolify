variable "access_key" {}
variable "secret_key" {}
variable "region" {
  default = "us-west-2"
}

variable "enterpriseapi_tag" {
  default = "latest"
}

variable "amis" {
  type = "map"
  default = {
    "us-west-1" = "ami-06397100adf427136"
    "us-west-2" = "ami-005bdb005fb00e791"
  }
}

variable "environment_tag" {
  description = "Environment tag"
  default     = "staging"
}

variable "instance_type" {
  default = "t3.micro"
}

variable "ssh_key_name" {
  default = "GigsterDev"
}

variable api_security_group_ids {
  description = "EC2 ssh security group"
  type        = "list"
  default     = ["sg-1a2ef262"]
}

variable security_group_ids {
  description = "EC2 ssh security group"
  type        = "list"
  default     = ["sg-52815b2a"]
}

variable "ecs-runner-role" {
  default = "arn:aws:iam::847883372847:role/ecs-runner-role"
}

variable "ecs-execution-role" {
  default = "arn:aws:iam::847883372847:role/ecs-pay-staging-execution-role"
}

variable "ecs-cluster" {
  default = "arn:aws:ecs:us-west-2:847883372847:cluster/enterprise-api"
}

variable "vpc_id" {
  default = "vpc-50a41637"
}

variable "subnet_ids" {
  type    = "list"
  default = ["subnet-1dd6067a", "subnet-490d1561", "subnet-56336f0e", "subnet-c6bd578f"]

}

variable "listener_arn" {
  type = "string"
  default = "arn:aws:elasticloadbalancing:us-west-2:847883372847:listener/app/gateway/9152fd7ceb29350e/5c1dc0fe59608854"
}
