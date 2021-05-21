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
      name = "enterprise-production"
    }
  }
}

data "aws_lb_listener" "secure-listener" {
  arn = "${var.listener_arn}"
}

resource "aws_ecr_repository" "enterprise-runner" {
  name = "enterpriseapi/production/runner"
}

resource "aws_ecr_lifecycle_policy" "archive-policy" {
  repository = "${aws_ecr_repository.enterprise-runner.name}"

  policy = <<EOF
{
    "rules": [
        {
            "rulePriority": 1,
            "description": "Keep last 20 images",
            "selection": {
                "tagStatus": "any",
                "countType": "imageCountMoreThan",
                "countNumber": 20
            },
            "action": {
                "type": "expire"
            }
        }
    ]
}
EOF
}

resource "aws_ecs_task_definition" "service" {
  family                   = "enterprise-production"
  network_mode             = "awsvpc"
  task_role_arn            = "${var.ecs-runner-role}"
  execution_role_arn       = "${var.ecs-execution-role}"
  cpu                      = 4096
  memory                   = 8192
  requires_compatibilities = ["FARGATE"]
  tags = {
    Environment = "production"
    Application = "enterprise-api"
  }
  container_definitions = "${templatefile("task-definitions/service.json", { enterpriseapi_runner_repo = "${aws_ecr_repository.enterprise-runner.repository_url}:${var.enterpriseapi_tag}", enterpriseapi_tag = "${var.enterpriseapi_tag}" })}"
}

resource "aws_ecs_service" "production" {
  name                               = "production"
  cluster                            = "${var.ecs-cluster}"
  task_definition                    = "${aws_ecs_task_definition.service.arn}"
  launch_type                        = "FARGATE"
  desired_count                      = 1
  deployment_maximum_percent         = 100
  deployment_minimum_healthy_percent = 0
  health_check_grace_period_seconds  = 600

  network_configuration {
    assign_public_ip = true
    security_groups  = "${var.api_security_group_ids}"
    subnets          = "${var.subnet_ids}"
  }
  load_balancer {
    target_group_arn = "${aws_lb_target_group.production-1500.arn}"
    container_name   = "enterpriseapi"
    container_port   = 1500
  }

  lifecycle {
    ignore_changes = ["desired_count"]
  }
  tags = {
    Environment = "production"
    Application = "enterpriseapi"
  }
}

resource "aws_lb_target_group" "production-1500" {
  name        = "enterprise-production-lb-tg"
  port        = 1500
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = "${var.vpc_id}"
  deregistration_delay = 30

  health_check {
    path                = "/"
    port                = 1500
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 60
  }
}

resource "aws_lb_listener_rule" "host_based_routing" {
  listener_arn = "${data.aws_lb_listener.secure-listener.arn}"
  priority     = 63

  action {
    type = "forward"
    target_group_arn = "${aws_lb_target_group.production-1500.arn}"
  }

  condition {
    host_header {
      values = ["enterpriseapi.bento.africa"]
    }
  }
}
