variable "access_key" {}
variable "secret_key" {}
variable "region" {
  default = "us-west-2"
}


variable "amis" {
  type = "map"
  default = {
    "us-west-1" = "ami-06397100adf427136"
    "us-west-2" = "ami-005bdb005fb00e791"
  }
}

variable "ssh_private_key" {
  default = ""
}

variable security_group_ids {
  description = "EC2 ssh security group"
  type        = "list"
  default     = ["sg-52815b2a", "sg-08e004f7b3284a087"]
}
